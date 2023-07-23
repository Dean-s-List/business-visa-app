import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdateApplicantType } from "../lib/validators/applicants";
import { apiInstance } from "@/src//lib/utils/api";
import type { ApiResponseType } from "@/src/lib/types";

type UpdateApplicantApiResponseType = {
    result: { applicantId: string };
} & ApiResponseType;

export const updateData = async (id: string, data: UpdateApplicantType) => {
    return (await apiInstance
        .put(`/applicants/${id}`, data)
        .then((res) => res.data)) as UpdateApplicantApiResponseType;
};

const useUpdateApplicant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateApplicantType }) =>
            updateData(id, data),
        mutationKey: ["applicants", { type: "update" }],
        onSuccess: () => {
            queryClient.invalidateQueries(["applicants"]);
        },
    });
};

export default useUpdateApplicant;
