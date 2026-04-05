####
# This Dockerfile builds the Quarkus application in JVM mode.
# Note: Run this from the project root if you want to copy the whole context, 
# or adjust COPY if running from backend/
###

# Stage 1: Build
FROM gradle:jdk21-jammy AS build

WORKDIR /home/gradle/src

# Copy backend files
COPY --chown=gradle:gradle . /home/gradle/src/backend

WORKDIR /home/gradle/src/backend

# Build the application
RUN ./gradlew build -Dquarkus.package.type=uber-jar -x test

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copy the built artifact from the build stage
COPY --from=build /home/gradle/src/backend/build/*-runner.jar /app/application.jar
# Copy keys if they are needed at runtime
COPY --from=build /home/gradle/src/backend/src/main/resources/privateKey.pem /app/privateKey.pem
COPY --from=build /home/gradle/src/backend/src/main/resources/publicKey.pem /app/publicKey.pem

EXPOSE 8080
USER 1001

ENTRYPOINT ["java", "-jar", "/app/application.jar"]
