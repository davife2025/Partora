import { Router } from "express";
import * as searchController from "../controllers/search.controller.js";

export const searchRouter = Router();

searchRouter.get("/",          searchController.search);
searchRouter.post("/analyse",  searchController.analyseSong);
searchRouter.get("/recent",    searchController.recentSearches);
