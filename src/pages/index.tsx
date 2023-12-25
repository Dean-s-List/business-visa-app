import {
    Box,
    Button,
    HStack,
    SimpleGrid,
    Text,
    VStack,
} from "@chakra-ui/react";
import { format } from "date-fns";
import Head from "next/head";
import { useState } from "react";

import CustomAlertDialog from "../components/common/CustomAlertDialog";
import {
    showErrorToast,
    showLoadingToast,
    showSuccessToast,
} from "../components/common/ToastNotification";
import useApplicants from "../hooks/useApplicants";
import useUpdateApplicant from "../hooks/useUpdateApplicant";
import { logError } from "../lib/utils/general";
import ProtectedRoute from "@/src/components/auth/ProtectedRoute";
import CustomContainer from "@/src/components/common/CustomContainer";
import PageDataLoading from "@/src/components/common/PageDataLoading";
import PageDataNotFound from "@/src/components/common/PageDataNotFound";
import PageError from "@/src/components/common/PageError";

const RenderHomePage = () => {
    const { isLoading, isFetching, data, isError, refetch } = useApplicants();

    const { mutateAsync } = useUpdateApplicant();

    const [isOpenAcceptAlert, setIsOpenAcceptAlert] = useState<{
        [applicantId: string]: boolean;
    }>({});

    const [isOpenRejectAlert, setIsOpenRejectAlert] = useState<{
        [applicantId: string]: boolean;
    }>({});

    const [isAccepting, setIsAccepting] = useState<{
        [applicantId: string]: boolean;
    }>({});

    const [isRejecting, setIsRejecting] = useState<{
        [applicantId: string]: boolean;
    }>({});

    const openAcceptAlert = (id: number) => {
        setIsOpenAcceptAlert((prevState) => ({ ...prevState, [id]: true }));
    };

    const closeAcceptAlert = (id: number) => {
        setIsOpenAcceptAlert((prevState) => ({ ...prevState, [id]: false }));
    };

    const openRejectAlert = (id: number) => {
        setIsOpenRejectAlert((prevState) => ({ ...prevState, [id]: true }));
    };

    const closeRejectAlert = (id: number) => {
        setIsOpenRejectAlert((prevState) => ({ ...prevState, [id]: false }));
    };

    const acceptHandler = async (applicantId: number, email: string) => {
        setIsAccepting((prevState) => ({ ...prevState, [applicantId]: true }));
        const toastId = "accept-applicant";

        showLoadingToast({
            id: toastId,
            message: "Accepting applicant",
        });

        try {
            const response = await mutateAsync({
                id: applicantId,
                data: { status: "accepted", email },
            });

            if (!response.success) {
                throw new Error(response.message);
            }

            showSuccessToast({
                id: toastId,
                message: "Applicant accepted successfully!",
            });
        } catch (error) {
            logError("Error while accepting applicant =>", error);
            showErrorToast({
                id: toastId,
                message: "Something went wrong while accepting applicant!",
            });
        }
        setIsAccepting((prevState) => ({ ...prevState, [applicantId]: false }));
    };

    const rejectHandler = async (applicantId: number, email: string) => {
        setIsRejecting((prevState) => ({ ...prevState, [applicantId]: true }));
        const toastId = "reject-applicant";

        showLoadingToast({
            id: toastId,
            message: "Rejecting applicant",
        });

        try {
            const response = await mutateAsync({
                id: applicantId,
                data: { status: "rejected", email },
            });

            if (!response.success) {
                throw new Error(response.message);
            }

            showSuccessToast({
                id: toastId,
                message: "Applicant rejected successfully!",
            });
        } catch (error) {
            logError("Error while rejecting applicant =>", error);
            showErrorToast({
                id: toastId,
                message: "Something went wrong while rejecting applicant!",
            });
        }
        setIsRejecting((prevState) => ({ ...prevState, [applicantId]: false }));
    };

    if (isLoading || isFetching) {
        return <PageDataLoading loadingText="Loading Applicants" />;
    }

    if (isError || !data) {
        return (
            <PageError
                message="Something went wrong while loading applicants!"
                showRetryButton
                retryFn={refetch}
            />
        );
    }

    if (data.length === 0) {
        return <PageDataNotFound message="No applicants found!" />;
    }

    return (
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            {data.map((applicant) => {
                return (
                    <VStack
                        w="100%"
                        key={applicant.id}
                        border="2px"
                        borderColor="white"
                        borderRadius="10px"
                        p={4}
                        alignItems="flex-start"
                        spacing={6}
                        wordBreak="break-all"
                    >
                        <VStack w="100%" alignItems="flex-start">
                            <Text fontWeight={600}>Applicant ID</Text>
                            <Text color="purple.400">{applicant.id}</Text>
                        </VStack>
                        <VStack w="100%" alignItems="flex-start">
                            <Text fontWeight={600}>Name</Text>
                            <Text color="purple.400">{applicant.name}</Text>
                        </VStack>
                        <VStack w="100%" alignItems="flex-start">
                            <Text fontWeight={600}>Wallet Address</Text>
                            <Text color="purple.400">
                                {applicant.walletAddress}
                            </Text>
                        </VStack>
                        <VStack w="100%" alignItems="flex-start">
                            <Text fontWeight={600}>Email</Text>
                            <Text color="purple.400">{applicant.email}</Text>
                        </VStack>
                        <VStack w="100%" alignItems="flex-start">
                            <Text fontWeight={600}>Discord Username</Text>
                            <Text color="purple.400">
                                {applicant.discordId}
                            </Text>
                        </VStack>
                        <VStack w="100%" alignItems="flex-start">
                            <Text fontWeight={600}>
                                Q: How did you discover Dean&apos;s List?
                            </Text>
                            <Text color="purple.400">
                                {applicant.discovery}
                            </Text>
                        </VStack>
                        <VStack w="100%" alignItems="flex-start">
                            <Text fontWeight={600}>Country</Text>
                            <Text color="purple.400">{applicant.country}</Text>
                        </VStack>
                        <VStack w="100%" alignItems="flex-start">
                            <Text fontWeight={600}>
                                Q: Do you have a project?
                            </Text>
                            <Text color="purple.400">
                                {applicant.projectDetails || "N/A"}
                            </Text>
                        </VStack>
                        <VStack w="100%" alignItems="flex-start">
                            <Text fontWeight={600}>
                                Q: What do you expect from/after your Visa?
                            </Text>
                            <Text color="purple.400">
                                {applicant.expectation}
                            </Text>
                        </VStack>
                        <VStack w="100%" alignItems="flex-start">
                            <Text fontWeight={600}>Skills</Text>
                            <Text color="purple.400">
                                {applicant.skills?.join(", ") || "N/A"}
                            </Text>
                        </VStack>
                        <VStack w="100%" alignItems="flex-start">
                            <Text fontWeight={600}>
                                Q: What do you expect from/after your Visa?
                                (Elaborate Here as much as possible.)
                            </Text>
                            <Text color="purple.400">
                                {applicant.expectationDetails}
                            </Text>
                        </VStack>
                        <VStack w="100%" alignItems="flex-start">
                            <Text fontWeight={600}>Submission Date</Text>
                            <Text color="purple.400">
                                {format(
                                    new Date(applicant.createdAt),
                                    "MMM dd, yyyy hh:mm a"
                                )}
                            </Text>
                        </VStack>
                        <VStack w="100%" alignItems="flex-start">
                            <Text fontWeight={600}>Update Date</Text>
                            <Text color="purple.400">
                                {applicant.updatedAt
                                    ? format(
                                          new Date(applicant.updatedAt),
                                          "MMM dd, yyyy hh:mm a"
                                      )
                                    : "N/A"}
                            </Text>
                        </VStack>
                        <VStack w="100%" alignItems="flex-start">
                            <Text fontWeight={600}>Application Status</Text>
                            <Text color="purple.400">
                                {applicant.status === "accepted" && "Accepted"}
                                {applicant.status === "rejected" && "Rejected"}
                                {applicant.status === "pending" && "Pending"}
                            </Text>
                        </VStack>

                        {applicant.status === "pending" && (
                            <>
                                <HStack
                                    w="100%"
                                    justifyContent="flex-start"
                                    spacing={4}
                                >
                                    <Button
                                        colorScheme="green"
                                        onClick={() =>
                                            openAcceptAlert(applicant.id)
                                        }
                                        isLoading={isAccepting[applicant.id]}
                                        loadingText="Accepting"
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        colorScheme="red"
                                        onClick={() =>
                                            openRejectAlert(applicant.id)
                                        }
                                        isLoading={isRejecting[applicant.id]}
                                        loadingText="Rejecting"
                                    >
                                        Reject
                                    </Button>
                                </HStack>

                                <CustomAlertDialog
                                    title="Accept Applicant"
                                    body={`Are you sure you want to accept ${applicant.name} into the Business Visa program?`}
                                    isOpen={isOpenAcceptAlert[applicant.id]}
                                    onClose={() =>
                                        closeAcceptAlert(applicant.id)
                                    }
                                    actionText="Accept"
                                    actionFn={() =>
                                        acceptHandler(
                                            applicant.id,
                                            applicant.email
                                        )
                                    }
                                    type="success"
                                />
                                <CustomAlertDialog
                                    title="Reject Applicant"
                                    body={`Are you sure you want to reject ${applicant.name} for the Business Visa program?`}
                                    isOpen={isOpenRejectAlert[applicant.id]}
                                    onClose={() =>
                                        closeRejectAlert(applicant.id)
                                    }
                                    actionText="Reject"
                                    actionFn={() =>
                                        rejectHandler(
                                            applicant.id,
                                            applicant.email
                                        )
                                    }
                                    type="danger"
                                />
                            </>
                        )}
                    </VStack>
                );
            })}
        </SimpleGrid>
    );
};

export default function HomePage() {
    return (
        <>
            <Head>
                <title>Home | Business Visa App</title>
            </Head>

            <ProtectedRoute>
                <CustomContainer>
                    <Box py={20}>
                        <RenderHomePage />
                    </Box>
                </CustomContainer>
            </ProtectedRoute>
        </>
    );
}
