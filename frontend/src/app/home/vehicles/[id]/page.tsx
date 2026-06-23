'use server'

import { DescriptionItem } from '@/_components/DescriptionItem';
import { httpGet } from '@/_lib/server/query-api'
import Main from '../../_components/Main'; 
import DisplayOptionsMenu from '@/_components/DisplayOptionsMenu';
import { IVehicleData } from '../model';
import { CardHeader } from '@/_components/Card';



export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id;
    const data = await httpGet('vehicles/' + id);
    const vehicle = await data.json() as IVehicleData;
  
    return (

        <Main header={
            <CardHeader  >
                 <h3 className="px-1 text-base font-semibold text-gray-900">Informacje o pojeździe</h3>
                <DisplayOptionsMenu id={id} pageName='vehicles'></DisplayOptionsMenu>
            </CardHeader>}>
            <dl className="divide-y divide-gray-100"> 
                <DescriptionItem label='Marka i model' value={[vehicle.producer, vehicle.model].join(' ')}></DescriptionItem>
                <DescriptionItem label='VIN' value={vehicle.vin}></DescriptionItem>
                <DescriptionItem label='Numer rejestracyjny' value={vehicle.regNr}></DescriptionItem>
                <DescriptionItem label='Pojazd zastępczy' value={vehicle.isReplacementVehicle ? 'Tak' : 'Nie'}></DescriptionItem>
                <DescriptionItem label='Przebieg' value={vehicle.odo}></DescriptionItem>
                <DescriptionItem label='Właściciel' value={vehicle.ownerName}></DescriptionItem>
                <DescriptionItem label='Uwagi' value={vehicle.description}></DescriptionItem>
            </dl>
        </Main>
    )

}
