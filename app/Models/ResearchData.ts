import {
  Model,
} from "Illuminate/Database/Eloquent/index.ts";

export type ResearchDataSchema = {
  data_id?: number;
  name: string;
  timestamp: string;
  date_of_feedback: string;
  type_of_client: string;
  service_availed: string;
  purpose_of_transaction: string;
  puo_transacted: string;
  customer_rating: number;
  customer_feedback: string;
  fodoti: string;
  rsdafto: string;
  data_type: string;
};

class ResearchData extends Model<ResearchDataSchema> {
  protected static override _fillable = [
    "name",
    "timestamp",
    "date_of_feedback",
    "type_of_client",
    "service_availed",
    "purpose_of_transaction",
    "puo_transacted",
    "customer_rating",
    "customer_feedback",
    "fodoti",
    "rsdafto",
    "data_type"
  ];
  protected static override _table = "research_data";
  protected static override _primaryKey = "data_id";
  protected static override _timeStamps = false;
  
}

export default ResearchData;
