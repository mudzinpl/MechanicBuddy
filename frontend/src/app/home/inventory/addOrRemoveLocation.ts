'use server'

import { httpPost, httpDelete } from "@/_lib/server/query-api";
import {  pushToast } from "@/_lib/server/pushToast"; 


export async function removeLocation(
    locationId : string,
    ) {
        
      await httpDelete({
        url:"storages",
        body:[locationId]
      })
      pushToast(`Lokalizacja została usunięta.`) 
}


export async function addLocation(
  newName : string,
  ) {
     
    const locationResponse = await httpPost({
      url:"storages",
      body:{
          name:newName
      }
    })

    const newLocationId = await locationResponse.json();

    pushToast(`Nowa lokalizacja została dodana.`) 

    return newLocationId;
}
