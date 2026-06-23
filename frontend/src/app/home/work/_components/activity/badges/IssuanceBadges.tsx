import moment from "moment" 
import GreenBadge from "@/_components/GreenBadge"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelopeCircleCheck } from '@fortawesome/free-solid-svg-icons'
 
import RedBadge from "@/_components/RedBadge"
import BlueBadge from "@/_components/BlueBadge"
import { IIssuance, IOfferIssuance, IWorkIssuance } from "../../../model"

const isOverDue = (issuance: IWorkIssuance) => { 
    const dueDate = new Date(issuance.issuedOn);
    dueDate.setDate(dueDate.getDate() + issuance.dueDays);
    return !issuance.isPaid && dueDate <= new Date();
}

export function IssuanceBadges({
    issueance 

}: {
    issueance: IIssuance 
}) {

    const offerIssuance = issueance as IOfferIssuance;
    const workIssuance = issueance as IWorkIssuance;
   
    if(!issueance) throw new Error('issuance null');

    return (
        <> 
           <GreenBadge text='Wystawiono' title={'Wystawiono ' + moment(issueance.issuedOn, true).locale('pl').format('DD.MM.YYYY HH:mm') + ' przez ' + issueance.issuedBy} ></GreenBadge>
           {offerIssuance.acceptedOn && <>{' '}<GreenBadge text='Zaakceptowano' title={'Zaakceptowano ' + moment(offerIssuance.acceptedOn, true).locale('pl').format('DD.MM.YYYY HH:mm') + ' przez ' + offerIssuance.acceptedBy} ></GreenBadge></>}
           <EmailSentBadge issueance={issueance}></EmailSentBadge>
           <OverdueBadge issueance={workIssuance}></OverdueBadge>
           {workIssuance.invoiceNumber && workIssuance.isPaid && !isOverDue(workIssuance) && <> <GreenBadge text="Opłacona"></GreenBadge></>}
           {workIssuance.invoiceNumber && !workIssuance.isPaid && !isOverDue(workIssuance) && <> <BlueBadge text="Nieopłacona"></BlueBadge></>}
        </>
    )
}


export function OverdueBadge({
    issueance 

}: {
    issueance: IWorkIssuance 
})
{ 
    return (
        <>{issueance?.invoiceNumber && isOverDue(issueance) && <> <RedBadge text="Po terminie" ></RedBadge></>}</>
    )
}

export function EmailSentBadge({
    issueance 

}: {
    issueance: IIssuance 
})
{
    return (
        <>{issueance?.sentOn && <span title={'Wiadomość e-mail wysłano do ' + issueance.receiverEmail + ' dnia ' + moment(issueance.sentOn, true).locale('pl').format('DD.MM.YYYY HH:mm')}><FontAwesomeIcon icon={faEnvelopeCircleCheck}  size="lg" color='Green' /></span>}</>
    )
}
