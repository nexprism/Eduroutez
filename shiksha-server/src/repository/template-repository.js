import Template from "../models/Template.js";
import CrudRepository from "./crud-repository.js";

class TemplateRepository extends CrudRepository {
  constructor() {
    super(Template);
  }
}

export { TemplateRepository };
