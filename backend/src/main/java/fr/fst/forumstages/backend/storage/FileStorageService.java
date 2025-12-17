package fr.fst.forumstages.backend.storage;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.errors.ErrorResponseException;
import io.minio.errors.InsufficientDataException;
import io.minio.errors.InternalException;
import io.minio.errors.InvalidResponseException;
import io.minio.errors.ServerException;
import io.minio.errors.XmlParserException;
import io.minio.http.Method;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

@Service
public class FileStorageService {

    private final MinioClient minioClient;

    private final String resumeBucket;
    private final String coverLetterBucket;

    public FileStorageService(
            MinioClient minioClient,
            @Value("${s3.bucket.resumes}") String resumeBucket,
            @Value("${s3.bucket.coverLetters}") String coverLetterBucket
    ) {
        this.minioClient = minioClient;
        this.resumeBucket = resumeBucket;
        this.coverLetterBucket = coverLetterBucket;
    }

    public String getResumeUploadUrl(String objectName) throws Exception {
        return getUploadUrl(resumeBucket, objectName);
    }

    public String getResumeDownloadUrl(String objectName) throws Exception {
        return getDownloadUrl(resumeBucket, objectName);
    }

    public String getCoverLetterUploadUrl(String objectName) throws Exception {
        return getUploadUrl(coverLetterBucket, objectName);
    }

    public String getCoverLetterDownloadUrl(String objectName) throws Exception {
        return getDownloadUrl(coverLetterBucket, objectName);
    }

    private String getUploadUrl(String bucketName, String objectName) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.PUT)
                        .bucket(bucketName)
                        .object(objectName)
                        .build()
        );
    }

    private String getDownloadUrl(String bucketName, String objectName) throws ServerException, InsufficientDataException, ErrorResponseException, IOException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(bucketName)
                        .object(objectName)
                        .build()
        );
    }
}
