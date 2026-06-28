'use server'

import { httpGet } from '@/_lib/server/query-api'
import { IWorkData, IActivities, IOfferIssuance, IWorkDocument, IWorkStatusHistory } from '../model';
import { IWorkCommunicationEntry } from '../communicationModel';
import { Card, CardHeader } from '@/_components/Card';
import NoProducts from '../_components/NoProducts';
import { createOrUpdateProducts } from '../actions/createOrUpdateProducts';
import Activities from '../_components/AllActivities';
import Activity from '../_components/Activity'; 
import PricingDownloadLink from '../_components/activity/PricingDownloadLink';
import { getActivityDisplayName } from '../_components/activity/getActivityDisplayName';
import { IssuanceBadges } from '../_components/activity/badges/IssuanceBadges'; 
import { ActivityCreatedBy } from '../_components/activity/ActivityCreatedBy';
import clsx from 'clsx'; 
import ActivitySelect from '../_components/ActivitySelect'; 
import CaseFlowTimeline from '../_components/CaseFlowTimeline';


 
export default async function Page({
    params,
}: {
    params: Promise<{ slug: string[] }>
}) {

    const [id, activityId, action, startfresh] = (await params).slug;

    let data = await httpGet('work/' + id);
    const work = await data.json() as IWorkData;

    data = await httpGet(!activityId ? 'work/' + id + '/activities' : 'work/' + id + '/activities/' + activityId);
    const activities = await data.json() as IActivities;

    const isEditing = action == 'edit';
    const current = activities.current;

    const activity = current ? activities?.items?.find(x => x.id == current.id) : undefined;
    if(!current || !activity) {
        return (
            <main className='pl-0 lg:pl-62 2xl:pr-108'>
                <div className="px-4 xl:py-10 xl:px-8 xl:py-6">
                    <Card header={<CardHeader title="Brak aktywności zlecenia" />}>
                        <p className="text-sm text-gray-600">
                            To zlecenie nie ma poprawnie utworzonej aktywności naprawy lub oferty. Odtwórz dane demonstracyjne APPRA albo skontaktuj się z administratorem.
                        </p>
                    </Card>
                </div>
            </main>
        );
    }
    const activityName = activity.name;
    const activityNumber = activity.number;
 
    data = await httpGet('pricings/offers/' + work.id);
    const issueances = await data.json() as IOfferIssuance[]; 
    const issuance = issueances.find(x => x.id === activity?.id)

    data = await httpGet(`work/${work.id}/documents`);
    const documents = await data.json() as IWorkDocument[];

    data = await httpGet(`work/${work.id}/communication`);
    const communicationEntries = await data.json() as IWorkCommunicationEntry[];

    data = await httpGet(`workstatushistory/${work.id}`);
    work.statusHistory = await data.json() as IWorkStatusHistory[];
 
    const activityDisplayName = getActivityDisplayName(activityName,activityNumber,issuance?.number);


    return (
        <div  >
              <Activities work={work} issueances={issueances} activities={activities} documents={documents} communicationEntries={communicationEntries}></Activities>
            <main className='pl-0 lg:pl-62  2xl:pr-108  '>
                <div>
                    <div className="  px-4  xl:py-10 xl:px-8 xl:py-6 ">
                        <div className='flex flex-col border-t border-gray-200 xl:border-t-0  '>

                            <div className="mb-4 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5">
                                <CaseFlowTimeline work={work}></CaseFlowTimeline>
                            </div>

                            {activity && <Card header={
                                <CardHeader> 
                                   <div className={clsx( "flex gap-x-2 mb-4 xl:ml-4")}>
                                        <div className='grid grid-flow-col  gap-2'>
                                            <div className='-mr-2'><ActivitySelect issueances={issueances} work={work} activities={activities} ></ActivitySelect>    </div>
                                            <div className='xs:-ml-4 -ml-2 my-1'>
                                            <h3 className={clsx(activities.items.length>1 && "hidden", "text-base  2xl:block font-semibold text-gray-900")}>{activityDisplayName}</h3>
                                            </div>
                                            <div  className='my-1' > 
                                                {issuance && <PricingDownloadLink name="Oferta" hideLabel={!!issuance.number} id={issuance.id} number={issuance.number} ></PricingDownloadLink>}
                                                </div>
                                            <div className='flex gap-x-2 my-1'>
                                                {issuance && <IssuanceBadges issueance={issuance}   ></IssuanceBadges>} </div>
                                        </div> 
                                    </div>  
                                
                                   <div className='hidden xl:flex gap-x-2 mb-4  xl:ml-4' > 
                                        <ActivityCreatedBy activity={activity}></ActivityCreatedBy> 
                                    </div>  
                                  
                                </CardHeader>}> 
                                {current.products.length == 0 && !current?.notes && !isEditing ? <NoProducts work={work} activityId={current.id}></NoProducts>
                                    : <form action={createOrUpdateProducts}>
                                        <input type="hidden" name="workId" value={work.id}></input>
                                        <input type="hidden" name="activityId" value={current.id}></input>
                                        <input type="hidden" name="activityName" value={activityName}></input>
                                        <input type="hidden" name="activityNumber" value={activityNumber}></input>
                                        <Activity issuance={issuance} edit={isEditing} work={work} activities={activities} startfresh={startfresh === 'startfresh'}  ></Activity>
                                    </form>
                                }
                              
                            </Card>}
                        </div>
                    </div>
                </div>
            </main>
          
        </div>
    )
}
