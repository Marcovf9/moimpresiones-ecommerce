# Imagen del backend para Render. Render no tiene un entorno Java nativo:
# construye y corre esta imagen.

# ── Compilacion ───────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# Primero solo el pom: asi las dependencias quedan en cache y un cambio de
# codigo no las vuelve a bajar.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
# Los tests corren aca: si alguno falla, no se publica la imagen.
RUN mvn -B -q package

# ── Ejecucion ─────────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Queda como root a proposito: el disco persistente de Render, donde van los
# adjuntos de las cotizaciones, se monta con permisos de root.
# Sin tope de memoria la JVM asume la de la maquina y Render la termina.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
