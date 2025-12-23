import { Factory } from "Illuminate/Database/Eloquent/Factories/index.ts";
import ResearchData from "App/Models/ResearchData.ts";

export default class ResearchDataFactory extends Factory {

  protected override _model = ResearchData;

  public definition() {
    return {
      email: this.faker.email(),
      password: this.faker.password(12),
      name: this.faker.name()
    };
  }
}
