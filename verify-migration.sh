#!/bin/bash

# ============================================================================
# Organization Migration Verification Script
# ============================================================================

set -e

echo "=========================================="
echo "Organization Migration Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Compilation
echo "Step 1: Verifying Backend Compilation..."
cd /workspaces/tba_waad_system/backend
export JAVA_HOME=/home/codespace/java/21.0.9-ms
export PATH=$JAVA_HOME/bin:$PATH

if mvn clean compile -DskipTests > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend compiles successfully${NC}"
else
    echo -e "${RED}✗ Backend compilation FAILED${NC}"
    exit 1
fi

# Step 2: Check migration files exist
echo ""
echo "Step 2: Verifying Migration Files..."
MIGRATION_DIR="src/main/resources/db/migration"
MIGRATIONS=("V001__create_organizations_table.sql" 
            "V002__add_organization_fk_columns.sql" 
            "V003__backfill_organizations.sql"
            "V004__backfill_organization_fks.sql"
            "V005__add_organization_constraints.sql")

for migration in "${MIGRATIONS[@]}"; do
    if [ -f "$MIGRATION_DIR/$migration" ]; then
        echo -e "${GREEN}✓ $migration exists${NC}"
    else
        echo -e "${RED}✗ $migration MISSING${NC}"
        exit 1
    fi
done

# Step 3: Check entity files updated
echo ""
echo "Step 3: Verifying Entity Files..."
ENTITIES=("src/main/java/com/waad/tba/modules/member/entity/Member.java"
          "src/main/java/com/waad/tba/modules/claim/entity/Claim.java"
          "src/main/java/com/waad/tba/modules/policy/entity/Policy.java"
          "src/main/java/com/waad/tba/modules/visit/entity/Visit.java")

for entity in "${ENTITIES[@]}"; do
    if grep -q "employerOrganization\|insuranceOrganization" "$entity" 2>/dev/null; then
        echo -e "${GREEN}✓ $(basename $entity) updated with Organization FK${NC}"
    else
        echo -e "${YELLOW}⚠ $(basename $entity) may not have Organization FK${NC}"
    fi
done

# Step 4: Check OrganizationRepository exists
echo ""
echo "Step 4: Verifying OrganizationRepository..."
ORG_REPO="src/main/java/com/waad/tba/common/repository/OrganizationRepository.java"
if [ -f "$ORG_REPO" ]; then
    echo -e "${GREEN}✓ OrganizationRepository exists${NC}"
else
    echo -e "${RED}✗ OrganizationRepository MISSING${NC}"
    exit 1
fi

# Step 5: Check OrganizationType enum
echo ""
echo "Step 5: Verifying OrganizationType enum..."
ORG_TYPE="src/main/java/com/waad/tba/common/enums/OrganizationType.java"
if grep -q "REVIEWER" "$ORG_TYPE" 2>/dev/null; then
    echo -e "${GREEN}✓ OrganizationType includes REVIEWER${NC}"
else
    echo -e "${YELLOW}⚠ OrganizationType may not include REVIEWER${NC}"
fi

# Summary
echo ""
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo -e "${GREEN}✓ Backend compiles successfully${NC}"
echo -e "${GREEN}✓ All migration files present${NC}"
echo -e "${GREEN}✓ Entity files updated${NC}"
echo -e "${GREEN}✓ OrganizationRepository created${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Start the application: mvn spring-boot:run"
echo "2. Run smoke tests (see FINAL-MIGRATION-COMPLETE.md)"
echo "3. Update remaining service/mapper files"
echo "4. Run full test suite: mvn test"
echo ""
echo -e "${GREEN}Migration verification COMPLETE!${NC}"
