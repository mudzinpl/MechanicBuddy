'use server'

import { httpPut } from "@/_lib/server/query-api";
import { clearMustChangePassword } from "@/_lib/server/session";
import { redirect } from "next/navigation";

export async function changePasswordOnLogin(
  prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {

  const currentPassword = formData.get('currentPassword');
  const newPassword = formData.get('newPassword');
  const confirmPassword = formData.get('confirmPassword');

  // Validate passwords match
  if (newPassword !== confirmPassword) {
    return { error: "Nowe hasła nie są zgodne" };
  }

  // Validate password is not empty
  if (!newPassword || newPassword.toString().trim() === '') {
    return { error: "Hasło nie może być puste" };
  }

  let success = false;

  try {
    const body = {
      currentPassword,
      newPassword,
      confirmPassword
    };

    const response = await httpPut({ url: 'profile/changepassword', body });

    if (!response.ok) {
      const responseText = await response.text();
      console.log(responseText);
      return { error: "Nie udało się zmienić hasła" };
    }

    await response.text();

    // Clear the mustChangePassword flag
    await clearMustChangePassword();

    success = true;
  } catch (error) {
    console.error('Error changing password:', error);
    return { error: "Wystąpił błąd podczas zmiany hasła" };
  }

  // Redirect outside try-catch to avoid catching Next.js redirect error
  if (success) {
    redirect('/home/work');
  }

  return { error: "" };
}
