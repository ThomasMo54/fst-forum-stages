package fr.fst.forumstages.backend.notification;

public enum NotificationType {
    // Notifications étudiants
    APPLICATION_SUBMITTED("Candidature soumise"),
    APPLICATION_ACCEPTED("Candidature acceptée"),
    APPLICATION_REJECTED("Candidature refusée"),
    OFFER_MATCH("Offre correspondante"),

    // Notifications entreprises
    NEW_APPLICATION_RECEIVED("Nouvelle candidature"),

    // Notifications admin
    NEW_STUDENT_REGISTERED("Nouvel étudiant inscrit"),
    NEW_COMPANY_REGISTERED("Nouvelle entreprise inscrite");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}