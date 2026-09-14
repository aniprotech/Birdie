// hooks/useNavigationHelpers.js
import { useNavigate, useParams } from "react-router-dom";
import { useGlobalStore } from "../stores/useGlobalStore";
import useAuthStore from "../stores/authStore";

export const useNavigationHelpers = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { clientsPersonalDetailData } = useGlobalStore();
  const { userData } = useAuthStore();
  const clientFirstName = clientsPersonalDetailData ? `${clientsPersonalDetailData.firstName}` : "the client";
  const userFirstName = userData ? `${userData.firstName}` : "the user";
  return { navigate, id, clientFirstName, userFirstName , userData};
};
