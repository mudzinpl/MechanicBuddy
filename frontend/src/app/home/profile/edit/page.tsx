
'use server'

import SettingsTabs from '@/_components/SettingsTabs'
import Main from '../../_components/Main'
import { httpGet } from '@/_lib/server/query-api';
import FormInput from '@/_components/FormInput';
import { changePassword, createOrUpdate } from '../createOrUpdate';
import { IUserProfile } from '../model'; 
import ProfileImage from './ProfileImage';



export default async function Page() {

  const data = await httpGet('profile');
  const options = await data.json() as IUserProfile;
  
   
  return (

    <Main header={
      <SettingsTabs>
      </SettingsTabs>
    } narrow={true}>

      <div className="space-y-12">
      <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base/7 font-semibold text-gray-900   my-4" >Dane osobowe</h2>
            <form  action={createOrUpdate}>
              
            <div className="  grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <ProfileImage options={options}></ProfileImage>
              <div className="sm:col-span-3">
                <FormInput name='firstName' label='Imię' defaultValue={options.firstName}></FormInput>
              </div>
              <div className="sm:col-span-3">
                <FormInput name='lastName' label='Nazwisko' defaultValue={options.lastName}></FormInput>
              </div>
              <div className="sm:col-span-full">
                <FormInput name='email' label='Email' defaultValue={options.email}></FormInput>
              </div>
              <div className="sm:col-span-full">
                <FormInput name='userName' label='Nazwa użytkownika' defaultValue={options.userName}></FormInput>
              </div>
              <div className="sm:col-span-full flex items-center justify-end gap-x-6">

                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Zapisz
                </button>
              </div>
            </div>
            </form>
          </div>
       
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base/7 font-semibold text-gray-900">Zmień hasło</h2>
          <form   action={changePassword}>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-full">
              <FormInput name='currentPassword' type='password' label='Aktualne hasło' ></FormInput>
            </div>
            <div className="sm:col-span-full">
              <FormInput name='newPassword' type='password' label='Nowe hasło' ></FormInput>
            </div>
            <div className="sm:col-span-full">
              <FormInput name='confirmPassword' type='password' label='Potwierdź hasło' ></FormInput>
            </div>
            <div className="sm:col-span-full flex items-center justify-end gap-x-6">

              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Save
              </button>
            </div>
          </div>
          </form>
        </div>
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base/7 font-semibold text-gray-900">Usuń konto</h2>
          <p className="mt-1 text-sm/6 text-gray-400">Nie chcesz już korzystać z usługi? Możesz usunąć konto tutaj. Tej operacji nie można cofnąć, a wszystkie dane powiązane z kontem zostaną trwale usunięte.</p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-full flex items-center justify-end gap-x-6">
              <button
                type="submit"
                className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-400"
              >
                Tak, usuń moje konto
              </button>
            </div>
          </div>
        </div>
      </div>

    </Main>
  )

}



