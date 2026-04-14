import { Elysia } from "elysia";
import { FormSubmissionService } from "./service";
import { FormSubmissionModel } from "./model";

export const formSubmissionModule = new Elysia({ prefix: "/forms" })
  .get("/", ({ query }) => FormSubmissionService.list(query as any), {
    query: FormSubmissionModel.query,
  })
  .post("/submit", ({ body }) => FormSubmissionService.submit(body as any), {
    body: FormSubmissionModel.createBody,
  })
  .patch("/:id/status", ({ params: { id }, body }) => 
    FormSubmissionService.updateStatus(id, body as any), {
    body: FormSubmissionModel.updateStatusBody,
  })
  .delete("/:id", ({ params: { id } }) => FormSubmissionService.delete(id));
