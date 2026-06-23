'use server'
 
import { CardHeader } from '@/_components/Card'; 
import { httpGet } from '@/_lib/server/query-api'; 
 
import WorkInput from '../../_components/WorkInput';
import { createOrUpdate } from '../../actions/createOrUpdate';
import { IMechanic, IWorkData, IWorkDocument } from '../../model';
import Main from '@/app/home/_components/Main';

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
 
    
     const id = (await params).id;
     const path = 'work/'+id; 
    const data = await httpGet(path);
    const work = await data.json() as IWorkData;
    const response  = await httpGet('employees');
    const employees = await response.json() as IMechanic[];
    const documentsResponse = await httpGet(`work/${id}/documents`);
    const documents = await documentsResponse.json() as IWorkDocument[];
  

    return (
        <Main header={<CardHeader title='Informacje o zleceniu' description='Edytuj dane' ></CardHeader>}>
            <form action={createOrUpdate}>
                <input type="hidden" name='id' value={id} ></input>
                <WorkInput work={work} mechanics={employees} documents={documents}  ></WorkInput>
            </form>
        </Main>
    )
}
