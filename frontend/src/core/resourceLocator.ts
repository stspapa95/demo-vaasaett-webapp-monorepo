import "reflect-metadata";
import { Container } from "inversify";
import { registerPriceBindings } from "@/core/bindings/prices-bindings";

export const rl = new Container({ defaultScope: "Singleton" });
registerPriceBindings(rl);
