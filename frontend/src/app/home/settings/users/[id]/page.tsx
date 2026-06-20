'use server'

import { DescriptionItem } from '@/_components/DescriptionItem';
import { httpGet } from '@/_lib/server/query-api'
import Main from '../../../_components/Main';
import DisplayOptionsMenu from '@/_components/DisplayOptionsMenu';
import { IUser } from '../model';
import BlueBadge from '@/_components/BlueBadge';
import YellowBadge from '@/_components/YellowBadge';
import { CardHeader } from '@/_components/Card';
import DeleteUserButton from '../_components/DeleteUserButton';
import { deleteUser } from '../createOrUpdate';

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id;
    const data = await httpGet('usermanagement/' + id);
    const user = await data.json() as IUser;

    return (
        <Main header={
            <CardHeader>
                <h3 className="px-1 lg:px-0 text-base font-semibold text-gray-900">Informacje o użytkowniku{' '}
                    {user.isDefaultAdmin && <BlueBadge text='Główny administrator' />}{' '}
                    {user.mustChangePassword && <YellowBadge text='Wymagana zmiana hasła' />}
                </h3>

                <div className="flex gap-2">
                    {!user.isDefaultAdmin && (
                        <form action={deleteUser}>
                            <input type="hidden" name='id' value={id}></input>
                            <DeleteUserButton />
                        </form>
                    )}
                    <DisplayOptionsMenu id={id} pageName='settings/users'></DisplayOptionsMenu>
                </div>
            </CardHeader>}>
            <div className="border-gray-100">
                <dl className="divide-y divide-gray-100">
                    <DescriptionItem label='Imię i nazwisko' value={`${user.firstName} ${user.lastName}`}></DescriptionItem>
                    <DescriptionItem label='Nazwa użytkownika' value={user.userName}></DescriptionItem>
                    <DescriptionItem label='Email' value={user.email}></DescriptionItem>
                    <DescriptionItem label='Telefon' value={user.phone || 'N/A'}></DescriptionItem>
                    <DescriptionItem label='Główny administrator' value={user.isDefaultAdmin ? 'Tak' : 'Nie'}></DescriptionItem>
                    <DescriptionItem label='Wymagana zmiana hasła' value={user.mustChangePassword ? 'Tak' : 'Nie'}></DescriptionItem>
                </dl>
            </div>
        </Main>
    )
}
