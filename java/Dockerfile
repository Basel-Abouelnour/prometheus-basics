FROM eclipse-temurin:17-jre

WORKDIR /app

COPY target/spring-prometheus-demo-1.0.jar app.jar

EXPOSE 6666

ENTRYPOINT ["java","-jar","/app/app.jar"]
