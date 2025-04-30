'use server'
import {z} from "zod";
import {salable} from "../../../app/salable";
import {Result} from "../check";

const zodUpdateLicenseRequestBody = z.object({
  uuid: z.string().uuid(),
  granteeId: z.string().nullable(),
});
type UpdateLicenseRequestBody = z.infer<typeof zodUpdateLicenseRequestBody>

export async function updateLicense(formData: UpdateLicenseRequestBody): Promise<Result<null>> {
  try {
    const data = zodUpdateLicenseRequestBody.parse(formData)
    await salable.licenses.update(formData.uuid, {
      granteeId: data.granteeId,
    })
    return {
      data: null, error: null
    }
  } catch (error) {
    console.log(error)
    return {
      data: null,
      error: 'Failed to update license'
    };
  }
}