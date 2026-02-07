# EMR Backend

## Tech Stack
- Java 21, Quarkus 3.17, Gradle
- PostgreSQL, Liquibase, SmallRye JWT

## Package Structure
```
com.ems/
├── common/           # Shared utilities
│   ├── entity/       # BaseEntity, TenantEntity
│   ├── exception/    # Global exception handlers
│   ├── security/     # JWT utilities, SecurityContext
│   └── config/       # Application configuration
├── auth/             # Authentication feature
├── hospital/         # Hospital/Workspace management
├── user/             # User & Role management
└── patient/          # Patient & Medical records
```

## Conventions

### Entities
- Extend `BaseEntity` for audit fields (createdBy, modifiedBy, createdAt, modifiedAt)
- Extend `TenantEntity` for hospital-scoped entities (includes hospital_id FK)

### REST Resources
- Use `@Path("/api/v1/{feature}")` pattern
- Return DTOs, not entities
- Apply `@RolesAllowed` for access control

### Services
- Business logic in `*Service` classes
- Inject `SecurityIdentity` for current user context
- Always filter by hospitalId for tenant isolation

### Repositories
- Extend `PanacheRepository<Entity>`
- Use named queries for complex operations
- Include hospitalId in all tenant-scoped queries

### DTOs
- Separate Request/Response DTOs
- Use records for immutability
- Validate with Bean Validation annotations

## Commands

```bash
# Run dev mode
./gradlew quarkusDev

# Run tests
./gradlew test

# Build JVM jar
./gradlew build

# Build native (requires GraalVM)
./gradlew build -Dquarkus.native.enabled=true
```

## Configuration
- `application.properties` - Base config
- `application-dev.properties` - Local development
- `application-prod.properties` - Production

## Database Migrations
Located in `src/main/resources/db/changelog/`
- `db.changelog-master.xml` - Master changelog
- `001-create-hospital.xml` - Hospital schema
- `002-create-user-role.xml` - User/Role schema
- `003-create-patient.xml` - Patient & medical records

## Security
- JWT tokens with hospitalId, userId, roles claims
- Roles: ADMIN, DOCTOR, NURSE, STAFF
- Passwords hashed with BCrypt
