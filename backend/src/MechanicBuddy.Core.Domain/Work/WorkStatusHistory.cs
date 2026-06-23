using System;

namespace MechanicBuddy.Core.Domain
{
    public class WorkStatusHistory : GuidIdentityEntity
    {
        protected WorkStatusHistory() { }

        public WorkStatusHistory(Work work, WorkStatus oldStatus, WorkStatus newStatus, Employee changedBy, string comment = null)
        {
            Work = work ?? throw new ArgumentNullException(nameof(work));
            OldStatus = oldStatus;
            NewStatus = newStatus;
            ChangedBy = changedBy;
            Comment = string.IsNullOrWhiteSpace(comment) ? null : comment.Trim();
            ChangedOn = DateTime.Now;
        }

        public virtual Work Work { get; protected set; }
        public virtual WorkStatus OldStatus { get; protected set; }
        public virtual WorkStatus NewStatus { get; protected set; }
        public virtual string Comment { get; protected set; }
        public virtual Employee ChangedBy { get; protected set; }
        public virtual DateTime ChangedOn { get; protected set; }
    }
}
