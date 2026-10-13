/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as academic from "../academic.js";
import type * as academicValues from "../academicValues.js";
import type * as access from "../access.js";
import type * as courses from "../courses.js";
import type * as meetings from "../meetings.js";
import type * as model from "../model.js";
import type * as profiles from "../profiles.js";
import type * as reminders from "../reminders.js";
import type * as support from "../support.js";
import type * as tasks from "../tasks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  academic: typeof academic;
  academicValues: typeof academicValues;
  access: typeof access;
  courses: typeof courses;
  meetings: typeof meetings;
  model: typeof model;
  profiles: typeof profiles;
  reminders: typeof reminders;
  support: typeof support;
  tasks: typeof tasks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
