import Controller from "App/Http/Controllers/Controller.ts";
import ResearchData from "../../Models/ResearchData.ts";
import { pipeline } from "@xenova/transformers";
import * as XLSX from "xlsx";
import {Cache, Validator} from "Illuminate/Support/Facades/index.ts"

class ResearchDataController extends Controller {
    private readonly neutrals = [
        "nothing",
        "none",
        "non",
        "no comment",
        "no comments",
        ".",
        "no",
        "no complaints",
        "no complaint",
        "n/a",
        "n\\a",
        "na"
    ];
    private sentimentClassifier: any = null;
    public allTimeData: HttpDispatch = async ({request}) => {
        const old = await ResearchData.where("data_type", "old").get();
        const newData = await ResearchData.where("data_type", "new").get();
        const alltimeArr = [];

        // OLD DATA → take timestamp as-is
        for (const oldRow of old) {
            alltimeArr.push(oldRow.timestamp);
        }

        // NEW DATA → reformat date_of_feedback MM/DD/YYYY → YYYY/MM/DD
        for (const newRow of newData) {
            const splitter = newRow.date_of_feedback.split("/"); // [MM, DD, YYYY]
            const joining = [splitter[2], splitter[0], splitter[1]];
            const newdate = joining.join("/");

            alltimeArr.push(newdate);
        }

        // Same as echo json_encode()
        return response().json(alltimeArr);

    }

    public responseByYear: HttpDispatch = async ({request}) => {
        const {year} = await request.validate({
            "year": "required"
        });
        
        const oldData = await ResearchData.where("timestamp", "like", `${year}/%`).where("data_type", "old").where("fodoti", "!=", "none").where("fodoti", "!=", "nothing").get();
        const newData = await ResearchData.where("date_of_feedback", "like", `%/${year}`).where("data_type", "new").where("fodoti", "!=", "none").where("fodoti", "!=", "nothing").get();

        const oldArr: Record<string, unknown>[] = [];
        const newArr: Record<string, unknown>[] = [];
        const resultArr: Record<string, unknown>[][] = [];

        for (const row of oldData) {
            const result = await this.analyzeSentiment(row.fodoti ?? '');
            row.forceFill({
                sentiment: result
            });
            oldArr.push(row.toObject());
        }

        for (const row of newData) {
            const result = await this.analyzeSentiment(row.fodoti ?? '');
            row.forceFill({
                sentiment: result
            });
            newArr.push(row.toObject());
        }

        resultArr.push(
             oldArr
        );
        resultArr.push(
            newArr
        );

        return response().json(resultArr);
    }

    public comments: HttpDispatch = async ({request}) => {

        const {year, filtersenti} = await request.validate({
            year: "required",
            filtersenti: "required"
        }) as {year: string, filtersenti: "positive" | "negative" | "all" | "neutral"};

        const resultcomments = await ResearchData.where((query) => {
            query.where((subQuery) => {
                subQuery.where("timestamp", "like", `${year}/%`).where("data_type", "old");
            }).orWhere((subQuery) => {
                subQuery.where("date_of_feedback", "like", `%/${year}`).where("data_type", "new");
            }).where("fodoti", "!=", "none").where("fodoti", "!=", "nothing");
        }).get();


        const resultArrCom: Record<string, unknown>[][] = [];
        let counter = 0;
        let commentarray: Record<string, unknown>[] = [];

        for (const row of resultcomments) {
            const output = await this.analyzeSentiment(row.fodoti ?? '');
            switch (filtersenti) {
                case "positive":
                    if (output > 0) {
                        row.forceFill({
                            sentiment: output,
                        });
                    }
                    break;
                case "negative":
                    if (output < 0) {
                        row.forceFill({
                            sentiment: output,
                        });
                    }
                    break;
                case "neutral":
                    if (output === 0) {
                        row.forceFill({
                            sentiment: output
                        });
                    }
                    break;
                case "all":
                    row.forceFill({
                        sentiment: output
                    });
                    break;
            }

            commentarray.push(row.toObject());
            counter++;
            if (counter % 10 === 0) {
                resultArrCom.push(commentarray);
                commentarray = [];
            }
        }

        resultArrCom.push(commentarray);

        const counted: Record<string, unknown>[][] = [];
        resultArrCom.forEach((arr) => {
            if (arr.length) {
                counted.push(arr);
            }
        });

        return response().json(counted);
    }

    public ratings: HttpDispatch = async ({request}) => {
        const {year} = await request.validate({
            year: "required"
        }) as {year: string};

        const resultrating = await ResearchData.where((query)=>{
            query.where("timestamp", "like", `${year}/%`);
            query.where("data_type", "old");
        }).orWhere((query)=>{
            query.where("date_of_feedback", "like", `%/${year}`);
            query.where("data_type", "new");
        }).get();

        return response().json(resultrating.map((row) => row.toObject()));
    }

    public saveFromExcel: HttpDispatch = async ({request}) => {
        const file = request.file("file");
        const uint8 = file?._getContent();
        
        const workbook = XLSX.read(uint8, { type: "array", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

        if (!rows.length) {
            request.session.flash("error", "The uploaded file is empty.");
            return redirect().back();
        }
        const firstRow = rows.shift() as string[];
        const headerRow = [
            "Date of Actual Feedback",
            "Type of Client",
            "Services Availed",
            "Purpose of Transaction",
            "Person/Unit/Officer Transact with",
            "Customer Rating",
            "Customer Feedback",
            "Factor or Details of the Incident:",
            "Recommendations/Suggestions/Desired Action from the Office"
        ];
        const isValid = headerRow.length === firstRow.length && headerRow.every((header, index) => header === firstRow[index]);

        if (!isValid) {
            request.session.flash("error", "Invalid file format.");
            return redirect("/");
        }
        let uploaded = 0;
        const store = Cache.store("research");
        if (!(await store.has("insertData"))) {
            await store.forever("insertData", 0);
            await store.forever("insertDataTimestamp", date("Y-m-d 00:00:00"));
        }
                // Handle successful insert
        let count = await store.get("insertData") as number;
        for (const row of rows) {
            const date_of_feedback = this.formatDate(row[0]);
            const type_of_client = row[1] as string;
            const service_availed = row[2] as string;
            const purpose_of_transaction = row[3] as string;
            const puo_transacted = row[4] as string;
            const customer_rating = parseInt(row[5] as string, 10);
            const customer_feedback = row[6] as string;
            const fodoti = row[7] as string;
            const rsdafto = row[8] as string;
            if ((date_of_feedback.split("/").length === 3) && !isNaN(customer_rating) && customer_rating > 0) {
                const fulldata = {
                    name: "Anonymous",
                    timestamp: date("Y-m-d H:i:s"),
                    date_of_feedback,
                    type_of_client,
                    service_availed,
                    purpose_of_transaction,
                    puo_transacted,
                    customer_rating,
                    customer_feedback,
                    fodoti,
                    rsdafto,
                    data_type: "new"
                };
                
                if (count > 1000) {
                    break;
                } else {
                    const insert = await ResearchData.create(fulldata);
                    if (insert) {
                        count++;
                        uploaded++;
                    }
                }
            }
        }
        if (!uploaded) {
            request.session.flash("error", "No valid data uploaded.");
        } else {
            request.session.flash("success", `${uploaded} data uploaded.`);
            await store.increment("insertData", uploaded);
        }
        return redirect("/");
    }

    private formatDate(date: string) {
        const d = new Date(date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${mm}/${dd}/${yyyy}`;
    }

    public manual: HttpDispatch = async ({request}) => {
        const data = request.all();
        const validate = await Validator.make(data, {
            name: "required|max:255",
            date: "required",
            client_type: "required",
            purpose_of_transaction: "required",
            puo_transacted: "required",
            customer_rating: "required",
            customer_feedback: "required",
        })
        if (validate.fails()) {
            request.session.flash("error", "Please check required fields.");
            return redirect("/");
        }
        const servicesArr = [
            "registrar",
            "clinic",
            "cashier",
            "guidance",
            "library",
            "hr",
            "accounting",
            "budget",
            "gs",
            "cte",
            "cbm",
            "cas",
            "cet",
            "cite",
            "ict",
            "admin"
        ];
        const service_availed = servicesArr.filter(service => data[service]).join(';');
        const store = Cache.store("research");
        if (!(await store.has("insertData"))) {
            await store.forever("insertData", 0);
            await store.forever("insertDataTimestamp", date("Y-m-d 00:00:00"));
        }
        const count = await store.get("insertData") as number;
        if (count > 1000) {
            request.session.flash("error", "Data upload limit reached for today.");
            return redirect("/");
        }
        const insert = await ResearchData.create({
            name: data.name,
            timestamp: date("Y-m-d H:i:s"),
            date_of_feedback: this.formatDate(data.date as string),
            type_of_client: data.client_type,
            service_availed,
            purpose_of_transaction: data.purpose_of_transaction,
            puo_transacted: data.puo_transacted,
            customer_rating: data.customer_rating,
            customer_feedback: data.customer_feedback,
            fodoti: data.fodoti || 'none',
            rsdafto: data.rsdafto || 'none',
            data_type: "new"
        });
        if (insert) {
            request.session.flash("success", "Data uploaded successfully.");
            await store.increment("insertData");
        } else {
            request.session.flash("error", "Failed to upload data.");
        }

        return redirect("/");
    }

    private async analyzeSentiment(text: string) {
        if (this.neutrals.includes(text.toLowerCase())) {
            return 0; // NEUTRAL
        }
        if (!this.sentimentClassifier) {
            this.sentimentClassifier = await pipeline(
                "sentiment-analysis",
                "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
            );
        }
        const result = await this.sentimentClassifier(text);
        const label = result[0].label;

        if (label === "POSITIVE") {
            return 1; // POSITIVE
        } else {
            return -1; // NEGATIVE
        }
    }

}

export default ResearchDataController;