'use server'

import NewWorkIntakeInput from '../_components/NewWorkIntakeInput';
import { createOrUpdate } from '../actions/createOrUpdate';
import Main from '../../_components/Main';
import { CardHeader } from '@/_components/Card'; 

export default async function Page() {
    return (
        <Main header={<CardHeader title='Nowa szkoda' description='Rejestracja sprawy APPRA' ></CardHeader>}>
            <form action={createOrUpdate}>
                <input type="hidden" name='id'  ></input>
                <NewWorkIntakeInput></NewWorkIntakeInput>
            </form>
        </Main>
    )
}
