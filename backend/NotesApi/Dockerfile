# Stage 1 — build
# Use the full SDK image to restore dependencies and publish a release build.
# This stage is thrown away after; only the compiled output moves forward.
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY *.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish --no-restore


# dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore --version 9.0.0
# dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 9.0.0


# Stage 2 — runtime
# The ASP.NET runtime image is much smaller than the SDK (~220 MB vs ~800 MB)
# because it only contains what's needed to run the app, not to build it.
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "NotesApi.dll"]
