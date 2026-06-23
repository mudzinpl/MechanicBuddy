'use client'

import { useState } from 'react'
import FormInput from '@/_components/FormInput';
import FormLabel from '@/_components/FormLabel';
import { useRouter } from 'next/navigation';
import PrimaryButton from '@/_components/PrimaryButton';
import SecondaryButton from '@/_components/SecondaryButton';
import { IUser } from '../model';
import { appRoleOptions, normalizeAppRole } from '@/_lib/appRoles';

export default function UserInput({
    user
}: {
    user?: IUser | undefined
}) {

    const router = useRouter()

    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [userName, setUserName] = useState(user?.userName || '');
    const [email, setEmail] = useState(user?.email || '');

    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");
    const [userNameError, setUserNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    function validate(event: React.MouseEvent) {
        let hasError = false;

        if (!firstName) {
            setFirstNameError("Imię jest wymagane");
            hasError = true;
        } else {
            setFirstNameError("");
        }

        if (!lastName) {
            setLastNameError("Nazwisko jest wymagane");
            hasError = true;
        } else {
            setLastNameError("");
        }

        if (!userName) {
            setUserNameError("Nazwa użytkownika jest wymagana");
            hasError = true;
        } else {
            setUserNameError("");
        }

        if (!email) {
            setEmailError("Adres e-mail jest wymagany");
            hasError = true;
        } else {
            setEmailError("");
        }

        if (!user) {
            const password = (document.querySelector('[name="password"]') as HTMLInputElement)?.value;
            const confirmPassword = (document.querySelector('[name="confirmPassword"]') as HTMLInputElement)?.value;

            if (!password) {
                setPasswordError("Hasło jest wymagane");
                hasError = true;
            } else if (password !== confirmPassword) {
                setPasswordError("Hasła nie są zgodne");
                hasError = true;
            } else {
                setPasswordError("");
            }
        } else {
            const password = (document.querySelector('[name="password"]') as HTMLInputElement)?.value;
            const confirmPassword = (document.querySelector('[name="confirmPassword"]') as HTMLInputElement)?.value;

            if (password || confirmPassword) {
                if (password !== confirmPassword) {
                    setPasswordError("Hasła nie są zgodne");
                    hasError = true;
                } else {
                    setPasswordError("");
                }
            } else {
                setPasswordError("");
            }
        }

        if (hasError) {
            event.preventDefault();
        }
    }

    const selectedRole = user?.isDefaultAdmin ? 'administrator' : normalizeAppRole(user?.appRole);

    return (
        <>
            <div className="space-y-12">
                <div className="border-b border-gray-900/10 pb-12">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <FormInput
                                name='firstName'
                                inputError={firstNameError}
                                onInputChange={(e) => setFirstName(e.currentTarget.value)}
                                defaultValue={firstName}
                                label='Imię'
                                required
                            />
                        </div>
                        <div className="sm:col-span-3">
                            <FormInput
                                name='lastName'
                                inputError={lastNameError}
                                onInputChange={(e) => setLastName(e.currentTarget.value)}
                                defaultValue={lastName}
                                label='Nazwisko'
                                required
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <FormInput
                                name='userName'
                                inputError={userNameError}
                                onInputChange={(e) => setUserName(e.currentTarget.value)}
                                defaultValue={userName}
                                label='Nazwa użytkownika'
                                required
                                disabled={user?.isDefaultAdmin}
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <FormInput
                                name='email'
                                type='email'
                                inputError={emailError}
                                onInputChange={(e) => setEmail(e.currentTarget.value)}
                                defaultValue={email}
                                label='Email'
                                required
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <FormInput
                                name='phone'
                                defaultValue={user?.phone}
                                label='Telefon'
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <FormLabel name="appRole" label="Rola" />
                            {user?.isDefaultAdmin && <input type="hidden" name="appRole" value="administrator" />}
                            <select
                                id="appRole"
                                name="appRole"
                                defaultValue={selectedRole}
                                disabled={user?.isDefaultAdmin}
                                className="mt-2 block w-full rounded-md bg-white px-3 py-1.5 text-sm/6 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 disabled:bg-gray-100 disabled:text-gray-500"
                            >
                                {appRoleOptions.map((role) => (
                                    <option key={role.value} value={role.value}>{role.label}</option>
                                ))}
                            </select>
                        </div>

                        {!user && (
                            <>
                                <div className="sm:col-span-3">
                                    <FormInput
                                        name='password'
                                        type='password'
                                        inputError={passwordError}
                                        label='Hasło'
                                        required
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <FormInput
                                        name='confirmPassword'
                                        type='password'
                                        label='Potwierdź hasło'
                                        required
                                    />
                                </div>
                            </>
                        )}

                        {user && (
                            <>
                                <div className="sm:col-span-6">
                                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                                        Zmień hasło (opcjonalnie)
                                    </h3>
                                </div>
                                <div className="sm:col-span-3">
                                    <FormInput
                                        name='password'
                                        type='password'
                                        inputError={passwordError}
                                        label='Nowe hasło'
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <FormInput
                                        name='confirmPassword'
                                        type='password'
                                        label='Potwierdź nowe hasło'
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-x-6">
                <SecondaryButton onClick={() => router.back()}>Anuluj</SecondaryButton>
                <PrimaryButton onClick={validate}>Zapisz</PrimaryButton>
            </div>
        </>
    )
}
