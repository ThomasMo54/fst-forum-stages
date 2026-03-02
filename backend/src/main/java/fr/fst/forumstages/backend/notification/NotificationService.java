package fr.fst.forumstages.backend.notification;

import fr.fst.forumstages.backend.application.ApplicationEntity;
import fr.fst.forumstages.backend.application.ApplicationRepository;
import fr.fst.forumstages.backend.offer.OfferRepository;
import fr.fst.forumstages.backend.user.UserEntity;
import fr.fst.forumstages.backend.user.UserRepository;
import fr.fst.forumstages.backend.user.UserRole;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.management.relation.Role;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Slf4j
@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final OfferRepository offerRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            ApplicationRepository applicationRepository,
            OfferRepository offerRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.offerRepository = offerRepository;
    }

    public List<NotificationEntity> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<NotificationEntity> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(String notificationId) {
        NotificationEntity notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NoSuchElementException("Notification not found"));

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markMultipleAsRead(List<String> notificationIds) {
        notificationIds.forEach(this::markAsRead);
    }

    @Transactional
    public void markAllAsRead(String userId) {
        List<NotificationEntity> unreadNotifications = getUnreadNotifications(userId);
        unreadNotifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    @Transactional
    public void deleteUserNotifications(String userId) {
        notificationRepository.deleteByUserId(userId);
        log.info("All notifications deleted for user {}", userId);
    }

    //  Méthodes de création de notifications

    @Transactional
    public void notifyApplicationSubmitted(ApplicationEntity application) {
        // Récupérer le UserEntity depuis le StudentEntity
        UserEntity studentUser = userRepository.findByStudentId(application.getStudent().getId())
                .orElseThrow(() -> new NoSuchElementException("User not found for student"));

        String offerTitle = application.getOffer().getTitle();

        NotificationEntity notification = new NotificationEntity();
        notification.setUser(studentUser);
        notification.setType(NotificationType.APPLICATION_SUBMITTED);
        notification.setTitle("Candidature soumise");
        notification.setMessage(String.format("Votre candidature pour l'offre \"%s\" a été soumise avec succès.", offerTitle));
        notification.setApplication(application);
        notification.setOffer(application.getOffer());

        notificationRepository.save(notification);
        log.info("Notification created: Application submitted for student {}", studentUser.getEmail());
    }

    @Transactional
    public void notifyNewApplicationReceived(ApplicationEntity application) {
        // Récupérer le UserEntity depuis le CompanyEntity
        UserEntity companyUser = userRepository.findByCompanyId(application.getOffer().getCompany().getId())
                .orElseThrow(() -> new NoSuchElementException("User not found for company"));

        String studentName = application.getStudent().getFirstName() + " " + application.getStudent().getLastName();
        String offerTitle = application.getOffer().getTitle();

        NotificationEntity notification = new NotificationEntity();
        notification.setUser(companyUser);
        notification.setType(NotificationType.NEW_APPLICATION_RECEIVED);
        notification.setTitle("Nouvelle candidature");
        notification.setMessage(String.format("%s a postulé pour votre offre \"%s\".", studentName, offerTitle));
        notification.setApplication(application);
        notification.setOffer(application.getOffer());

        notificationRepository.save(notification);
        log.info("Notification created: New application received for company {}", companyUser.getEmail());
    }

    @Transactional
    public void notifyApplicationAccepted(ApplicationEntity application) {
        // Récupérer le UserEntity depuis le StudentEntity
        UserEntity studentUser = userRepository.findByStudentId(application.getStudent().getId())
                .orElseThrow(() -> new NoSuchElementException("User not found for student"));

        String offerTitle = application.getOffer().getTitle();
        String companyName = application.getOffer().getCompany().getName();

        NotificationEntity notification = new NotificationEntity();
        notification.setUser(studentUser);
        notification.setType(NotificationType.APPLICATION_ACCEPTED);
        notification.setTitle("Félicitations !");
        notification.setMessage(String.format("Votre candidature pour l'offre \"%s\" chez %s a été acceptée !", offerTitle, companyName));
        notification.setApplication(application);
        notification.setOffer(application.getOffer());

        notificationRepository.save(notification);
        log.info("Notification created: Application accepted for student {}", studentUser.getEmail());
    }

    @Transactional
    public void notifyApplicationRejected(ApplicationEntity application) {
        // Récupérer le UserEntity depuis le StudentEntity
        UserEntity studentUser = userRepository.findByStudentId(application.getStudent().getId())
                .orElseThrow(() -> new NoSuchElementException("User not found for student"));

        String offerTitle = application.getOffer().getTitle();

        NotificationEntity notification = new NotificationEntity();
        notification.setUser(studentUser);
        notification.setType(NotificationType.APPLICATION_REJECTED);
        notification.setTitle("Candidature non retenue");
        notification.setMessage(String.format("Votre candidature pour l'offre \"%s\" n'a malheureusement pas été retenue.", offerTitle));
        notification.setApplication(application);
        notification.setOffer(application.getOffer());

        notificationRepository.save(notification);
        log.info("Notification created: Application rejected for student {}", studentUser.getEmail());
    }

    public void notifyAdminNewUser(UserEntity newUser) {

        List<UserEntity> admins = userRepository.findByRole(UserRole.ADMIN);

        for (UserEntity admin : admins) {

            NotificationEntity notification = new NotificationEntity();
            notification.setUser(admin);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setRead(false);
            notification.setRelatedUser(newUser);

            if (newUser.getRole() == UserRole.STUDENT) {
                notification.setType(NotificationType.NEW_STUDENT_REGISTERED);
                notification.setTitle("Nouvel étudiant inscrit");
                notification.setMessage(
                        "Nouvel étudiant "
                                + newUser.getStudent().getFirstName() + " "
                                + newUser.getStudent().getLastName()
                                + " vient de s'inscrire."
                );
            }

            if (newUser.getRole() == UserRole.COMPANY) {
                notification.setType(NotificationType.NEW_COMPANY_REGISTERED);
                notification.setTitle("Nouvelle entreprise inscrite");
                notification.setMessage(
                        "Nouvelle entreprise "
                                + newUser.getCompany().getName()
                                + " vient de s'inscrire."
                );
            }

            notificationRepository.save(notification);
        }
    }
}