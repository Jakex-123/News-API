import vine from "@vinejs/vine";
import { ErrorReporter } from "./ErrorReporter.js";

vine.errorReporter=()=>new ErrorReporter()

export const newsSchema=vine.object({
    title:vine.string().minLength(5).maxLength(200),
    content:vine.string().minLength(10).maxLength(50000),
})