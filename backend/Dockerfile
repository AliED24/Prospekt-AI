# Build-Phase mit Maven und Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY demo/ .
RUN mvn clean package -DskipTests

# Laufzeit-Phase mit Java 21 JDK
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
