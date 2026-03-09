# Forum Stages

## Description

Forum Stages est une application web conçue pour faciliter la mise en relation entre les étudiants à la recherche de stages et les entreprises offrant des opportunités de stage. L'application permet aux étudiants de créer des profils, de rechercher des offres de stage, et de postuler directement via la plateforme. Les entreprises peuvent publier des offres, gérer les candidatures, et communiquer avec les candidats potentiels.

## Comment démarrer

### Backend

#### Prérequis

- Java 21 ou supérieur
- Base de données Mongodb

### Variables d'environnement

Avant de lancer l'application backend, assurez-vous de configurer les variables d'environnement suivantes :
- `MONGODB_URI` : L'URI de connexion à la base de données MongoDB.
- `MONGODB_DATABASE` : Le nom de la base de données MongoDB à utiliser.
- `JWT_SECRET` : La clé secrète pour la génération des tokens JWT.
- `EMAIL_HOST` : L'adresse du serveur SMTP pour l'envoi d'e-mails.
- `EMAIL_PORT` : Le port du serveur SMTP.
- `EMAIL_USERNAME` : Le nom d'utilisateur pour l'authentification SMTP.
- `EMAIL_PASSWORD` : Le mot de passe pour l'authentification SMTP.
- `MINIO_URL` : L'URL du serveur MinIO pour le stockage des fichiers.
- `MINIO_ACCESS_KEY` : La clé d'accès pour MinIO.
- `MINIO_SECRET_KEY` : La clé secrète pour MinIO.
- `MINIO_BUCKET_RESUMES` : Le nom du bucket MinIO pour stocker les CVs.
- `MINIO_BUCKET_COVERLETTERS` : Le nom du bucket MinIO pour stocker les lettres de motivation.

#### Lancement (sans Docker)

1. Cloner le dépôt :
```bash
git clone https://github.com/ThomasMo54/fst-forum-stages.git
```

2. Naviguer dans le répertoire backend :
```bash
cd backend
```

3. Construire le projet avec Maven :
```bash
mvn clean package
```

4. Lancer l'application :
```bash
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

#### Lancement (avec Docker)

1. Assurez-vous que Docker est installé et en cours d'exécution.

2. Cloner le dépôt :
```bash
git clone https://github.com/ThomasMo54/fst-forum-stages.git
```

3. Naviguer dans le répertoire backend :
```bash
cd backend
```

4. Construire l'image Docker :
```bash
docker build -t forum-stages-backend .
```

5. Lancer le conteneur Docker :
```bash
docker run -d -p 8080:8080 forum-stages-backend
```

### Frontend

#### Prérequis
- Node.js 22 ou supérieur
- npm

#### Variables d'environnement

Avant de lancer l'application frontend, assurez-vous de configurer les variables d'environnement suivantes :
- `VITE_API_URL` : L'URL de l'API backend (par exemple, `http://localhost:8080`).

#### Lancement (sans Docker)

1. Cloner le dépôt :
```bash
git clone https://github.com/ThomasMo54/fst-forum-stages.git
```

2. Naviguer dans le répertoire frontend :
```bash
cd frontend
```

3. Installer les dépendances :
```bash
npm install
```

4. Lancer l'application :
```bash
npm run dev
```

#### Lancement (avec Docker)

1. Assurez-vous que Docker est installé et en cours d'exécution.

2. Cloner le dépôt :
```bash
git clone https://github.com/ThomasMo54/fst-forum-stages.git
```

3. Naviguer dans le répertoire frontend :
```bash
cd frontend
```

4. Construire l'image Docker :
```bash
docker build -t forum-stages-frontend .
```

5. Lancer le conteneur Docker :
```bash
docker run -d -p 3000:3000 forum-stages-frontend
```

## Équipe

- Thomas MORETTI (Product Owner)
- Maël DEMANGEL (Scrum Master)
- Brahim NAJI
- Ines OULD AMAR
- Rim HAMIDA
- Samuel DARRAS
- Youssef FATHANI
