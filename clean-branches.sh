#!/bin/bash

# Branches you want to keep
KEEP_BRANCHES=("main" "dev" "METGO-2035-mini-campaign" "METGO-2523-itenery-ai-wizard" "METGO-2570-oder-summary-superadmin-view" )

# Get all local branches and delete those not in KEEP_BRANCHES
for branch in $(git branch --format='%(refname:short)'); do
    keep=false

    for keep_branch in "${KEEP_BRANCHES[@]}"; do
        if [ "$branch" = "$keep_branch" ]; then
            keep=true
            break
        fi
    done

    if [ "$keep" = false ]; then
        echo "Deleting branch: $branch"
        git branch -D "$branch"
    else
        echo "Keeping branch: $branch"
    fi
done