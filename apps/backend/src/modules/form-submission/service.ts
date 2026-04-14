import { prisma } from "../../lib/prisma";
import type { FormSubmissionModel } from "./model";

export abstract class FormSubmissionService {
  static async list(query: FormSubmissionModel["query"]) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;

    const [submissions, total] = await Promise.all([
      prisma.formSubmission.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.formSubmission.count({ where }),
    ]);

    return {
      data: submissions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async submit(body: FormSubmissionModel["createBody"]) {
    return prisma.formSubmission.create({
      data: {
        type: body.type as any,
        payload: body.payload as any,
        userId: body.userId,
      },
    });
  }

  static async updateStatus(id: string, body: FormSubmissionModel["updateStatusBody"]) {
    return prisma.formSubmission.update({
      where: { id },
      data: {
        status: body.status as any,
        adminNotes: body.adminNotes,
      },
    });
  }

  static async delete(id: string) {
    await prisma.formSubmission.delete({ where: { id } });
    return true;
  }
}
