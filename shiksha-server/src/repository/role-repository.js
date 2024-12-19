import Role from "../models/Role.js";
import CrudRepository from "./crud-repository.js";

class RoleRepository extends CrudRepository {
  constructor() {
    super(Role);
  }
}

export { RoleRepository };
