import { addActiveRequest } from "@/app/redux/reducer/chat/sendRequestSlice";
import toast from "react-hot-toast";

export const createRequestAndEmit = async ({
  createIntake,
  mode,
  astro_id,
  profileData,
  socket,
  connectSocket,
  astrologer,
  dispatch,
  router,
  userId,
  source,
}) => {
  try {
    const formattedBirthDate =
      String(profileData.birthDate).length > 10
        ? new Date(Number(profileData.birthDate)).toISOString().split("T")[0]
        : profileData.birthDate;

        console.log("PROFILE DATA", profileData);

    const response = await createIntake({
      variables: {
        input: {
          astrologerId: astro_id,
          name: profileData.name,
          countryCode: profileData.countryCode,
          mobile: profileData.phone || profileData.mobile,
          gender: profileData.usergender || profileData.gender,
          birthDate: profileData.dob || formattedBirthDate,
          birthTime: profileData.time || profileData.birthTime,
          occupation: profileData.occupation,
          birthPlace: profileData.place || profileData.birthPlace || "India",
          latitude: Number(profileData.latitude),
          longitude: Number(profileData.longitude),
          requestType: mode === "call" ? "CALL" : "CHAT",
          source:"WEB",
        },
      },
    });

    const { roomId, chatTime, intakeId, message, pricePerMin, pricingType } =
      response.data.createIntake;

    if (!intakeId) {
      toast.error("Failed to create intake");
      return;
    }

    if (
      message ===
      "duplicate request. User is already in queue for this astrologer"
    ) {
      toast.error("You already have a pending request for this astrologer.");
      return;
    }

    if (
      message === "Sorry, queue is too long. Please try another astrologer."
    ) {
      toast.error(message);
      return;
    }

    let activeSocket = socket;

    if (!activeSocket?.connected) {
      activeSocket = connectSocket();
    }

    const req_data = {
      name: profileData.name,

      gender: profileData.usergender || profileData.gender,

      dateOfBirth: profileData.dob || formattedBirthDate,

      timeOfBirth: profileData.time || profileData.birthTime,

      occupation: profileData.occupation,

      location: profileData.place || profileData.birthPlace || "India",

      userName: profileData.name,

      user_id: userId,

      astro_id,

      room_id: roomId,

      maximum_time: chatTime,

      phoneNumber: `${profileData.countryCode || ""}${
        profileData.phone || profileData.mobile || ""
      }`,

      // NEW PRICING DATA
      pricePerMin,

      pricingType,

      mode: mode === "call" ? "CALL" : "CHAT",
      source:"WEB",
    };

    const eventName = mode === "call" ? "call_request" : "chat_request";

    // console.log("FINAL ROOMmmmmmmmmmmmmmmmmmmmmmmmmmmmm:", roomId);

    // console.log("FINAL USERrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr:", userId);

    // console.log("FINAL ASTROooooooooooooooooooooooooooooooo:", astro_id);

    // console.log("FINAL PRICEeeeeeeeeeeeeeeeeeeeeeeeeeeee:", pricePerMin);

    activeSocket.emit(eventName, req_data);

    const requestKey =
      mode === "call" ? `call_request_${roomId}` : `chat_request_${roomId}`;

    localStorage.setItem(requestKey, JSON.stringify(req_data));

    dispatch(
      addActiveRequest({
        roomId,
        astrologer: {
          ...astrologer,
          pricePerMin,
          pricingType,
        },
        chatTime,
        userId,
        type: mode === "call" ? "call" : "chat",
      }),
    );

    activeSocket.emit("rejoin_queue", {
      room_id: roomId,
      astro_id,
      user_id: userId,
    });

    router.push(`/astrologer/${mode}`);
  } catch (err) {
    console.error(err);
    toast.error(err.message);
  }
};
