import BlueBadge from '@/_components/BlueBadge';
import DefaultBadge from '@/_components/DefaultBadge';
import GreenBadge from '@/_components/GreenBadge';
import RedBadge from '@/_components/RedBadge';
import YellowBadge from '@/_components/YellowBadge';
import { getDamageStatusLabel } from '../../../model';

export default function DamageStatusBadge({ status }: { status?: string | null }) {
    if (!status) return null;

    const label = getDamageStatusLabel(status);

    if (['accepted', 'ready_for_pickup', 'released', 'settled'].includes(status)) {
        return <GreenBadge text={label}></GreenBadge>;
    }

    if (['inspection_pending', 'approval_pending', 'parts_pending', 'on_hold'].includes(status)) {
        return <YellowBadge text={label}></YellowBadge>;
    }

    if (status === 'rejected') {
        return <RedBadge text={label}></RedBadge>;
    }

    if (['repair', 'paint_shop', 'quality_control'].includes(status)) {
        return <BlueBadge text={label}></BlueBadge>;
    }

    return <DefaultBadge text={label}></DefaultBadge>;
}
