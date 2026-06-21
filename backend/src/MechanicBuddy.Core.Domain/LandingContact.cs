using System;

namespace MechanicBuddy.Core.Domain
{
    public class LandingContact : GuidIdentityEntity
    {
        public virtual string SectionLabel { get; protected set; }
        public virtual string Headline { get; protected set; }
        public virtual string Description { get; protected set; }
        public virtual bool ShowTowing { get; protected set; }
        public virtual string TowingText { get; protected set; }
        public virtual string BusinessHours { get; protected set; } // JSON string
        public virtual DateTime CreatedAt { get; protected set; }
        public virtual DateTime UpdatedAt { get; protected set; }

        protected LandingContact() { }

        public LandingContact(
            string headline = "Kontakt",
            string sectionLabel = "Skontaktuj się z nami",
            string description = null,
            bool showTowing = false,
            string towingText = "Dostępna pomoc drogowa — zadzwoń do nas!",
            string businessHours = null,
            Guid? id = null)
        {
            Id = id ?? Guid.NewGuid();
            SectionLabel = sectionLabel ?? "Skontaktuj się z nami";
            Headline = headline ?? "Kontakt";
            Description = description;
            ShowTowing = showTowing;
            TowingText = towingText ?? "Dostępna pomoc drogowa — zadzwoń do nas!";
            BusinessHours = businessHours;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public virtual void Update(
            string sectionLabel,
            string headline,
            string description,
            bool showTowing,
            string towingText,
            string businessHours)
        {
            SectionLabel = sectionLabel ?? SectionLabel;
            Headline = headline ?? Headline;
            Description = description;
            ShowTowing = showTowing;
            TowingText = towingText ?? TowingText;
            BusinessHours = businessHours;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
