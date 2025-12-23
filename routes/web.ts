import { Route } from "Illuminate/Support/Facades/index.ts";
import ResearchDataController from "App/Http/Controllers/ResearchDataController.ts";

Route.view("/", "index");

Route.prefix("process").group(()=> {

    Route.post("/alltime", [ResearchDataController, "allTimeData"] );
    Route.post("/responsebyyear", [ResearchDataController, "responseByYear"] );
    Route.post("/comments", [ResearchDataController, "comments"] );
    Route.post("/ratings", [ResearchDataController, "ratings"] );
    Route.post("/", [ResearchDataController, "saveFromExcel"] );
    Route.post("/manual", [ResearchDataController, "manual"] );
})