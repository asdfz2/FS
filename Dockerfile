FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app
COPY back/pom.xml .
RUN mvn -B dependency:go-offline
COPY back/src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
