/**
 * PayPal tRPC Router
 * Procedures for creating and capturing PayPal orders.
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { createPayPalOrder, capturePayPalOrder } from "../paypal";

export const paypalRouter = router({
  /** Create a PayPal order for the given amount (in cents) */
  createOrder: publicProcedure
    .input(z.object({ amountCents: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      try {
        const order = await createPayPalOrder(input.amountCents);
        return { paypalOrderId: order.id };
      } catch (err: any) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err.message });
      }
    }),

  /** Capture a PayPal order after customer approval */
  captureOrder: publicProcedure
    .input(z.object({ paypalOrderId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        const result = await capturePayPalOrder(input.paypalOrderId);
        if (result.status !== "COMPLETED") {
          throw new TRPCError({ code: "BAD_REQUEST", message: `PayPal order not completed: ${result.status}` });
        }
        return result;
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err.message });
      }
    }),
});
