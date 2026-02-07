####
# This Dockerfile builds the Quarkus application in JVM mode, including the Frontend via Quinoa.
#
# IMPORTANT: Run this from the PROJECT ROOT (ems/), not backend/
# docker build -f backend/Dockerfile -t ems-app .
###

# Stage 1: Build
FROM gradle:jdk21-jammy AS build

# Install Node.js (required for frontend build via Quinoa)
RUN apt-get update && apt-get install -y ca-certificates curl gnupg && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && apt-get install -y nodejs && \
    node -v && npm -v

WORKDIR /home/gradle/src

# Copy only the necessary files first to leverage caching (if possible)
# Since Gradle might need the whole monorepo context for potential future multi-module setups,
# we copy everything but respect .dockerignore (which should be added)

# Copy the entire project context (frontend + backend)
# Because we are running from root context, '.' refers to 'ems/'
COPY --chown=gradle:gradle . .

# Move into backend directory to run the build
WORKDIR /home/gradle/src/backend

# Build the application (Quinoa will trigger npm install/build in ../frontend)
RUN ./gradlew build -Dquarkus.package.type=uber-jar -Dquarkus.quinoa.package-manager-install='npm install' -Dquarkus.quinoa.package-manager-build='npm run build' -x test

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copy the built artifact from the build stage
COPY --from=build /home/gradle/src/backend/build/*-runner.jar /app/application.jar
# Copy keys if they are needed at runtime (ensure these exist in backend/src/main/resources or are mounted as secrets)
# NOTE: In production, consider mounting keys via Secrets/Volumes instead of burning into image
COPY --from=build /home/gradle/src/backend/src/main/resources/privateKey.pem /app/privateKey.pem
COPY --from=build /home/gradle/src/backend/src/main/resources/publicKey.pem /app/publicKey.pem

EXPOSE 8080
USER 1001

ENTRYPOINT ["java", "-jar", "/app/application.jar"]
