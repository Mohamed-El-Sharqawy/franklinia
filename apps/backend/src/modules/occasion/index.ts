import { Elysia, status } from "elysia";
import { OccasionService } from "./service";
import { OccasionModel } from "./model";

export const occasion = new Elysia({ prefix: "/occasions" })
  .get(
    "/",
    async ({ query }) => {
      const isActive = query.isActive === "true" ? true : query.isActive === "false" ? false : undefined;
      const result = await OccasionService.list(isActive);
      if (!result.ok) return status(result.status, { success: false as const, error: result.error });
      return { success: true as const, data: result.data };
    },
    {
      query: OccasionModel.listQuery,
    }
  )
  .get(
    "/:id",
    async ({ params }) => {
      const result = await OccasionService.getById(params.id);
      if (!result.ok) return status(result.status, { success: false as const, error: result.error });
      return { success: true as const, data: result.data };
    },
    {
      params: OccasionModel.occasionParams,
    }
  )
  .post(
    "/",
    async ({ body }) => {
      const result = await OccasionService.create(body);
      if (!result.ok) return status(result.status, { success: false as const, error: result.error });
      return { success: true as const, data: result.data };
    },
    {
      body: OccasionModel.createBody,
    }
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const result = await OccasionService.update(params.id, body);
      if (!result.ok) return status(result.status, { success: false as const, error: result.error });
      return { success: true as const, data: result.data };
    },
    {
      params: OccasionModel.occasionParams,
      body: OccasionModel.updateBody,
    }
  )
  .delete(
    "/:id",
    async ({ params }) => {
      const result = await OccasionService.delete(params.id);
      if (!result.ok) return status(result.status, { success: false as const, error: result.error });
      return { success: true as const, data: result.data };
    },
    {
      params: OccasionModel.occasionParams,
    }
  );
