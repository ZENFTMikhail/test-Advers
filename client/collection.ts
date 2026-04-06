import { Mongo } from "meteor/mongo";
import { Customer } from "/imports/api/types";

export const CustomersCollection = new Mongo.Collection<Customer>("customers");
