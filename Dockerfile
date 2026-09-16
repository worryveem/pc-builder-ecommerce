FROM openjdk:17-ea-jdk-alpine3.14*

WORKDIR /app

COPY . .

CMD ["java", "-jar", "target/demo-0.0.1-SNAPSHOT.jar"]


# docker run -p 8080:8080 -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/fashion_shop -e SPRING_DATASOURCE_USERNAME=root -e SPRING_DATASOURCE_PASSWORD=root fashionshop