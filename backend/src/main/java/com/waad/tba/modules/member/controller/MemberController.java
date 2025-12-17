package com.waad.tba.modules.member.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.waad.tba.common.dto.ApiResponse;
import com.waad.tba.common.dto.PaginationResponse;
import com.waad.tba.modules.member.dto.MemberCreateDto;
import com.waad.tba.modules.member.dto.MemberSelectorDto;
import com.waad.tba.modules.member.dto.MemberUpdateDto;
import com.waad.tba.modules.member.dto.MemberViewDto;
import com.waad.tba.modules.member.service.MemberService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
@Tag(name = "Members", description = "APIs for managing insurance members")
public class MemberController {

    private final MemberService memberService;

    @GetMapping("/selector")
    @PreAuthorize("hasAuthority('VIEW_MEMBERS') or hasAuthority('MANAGE_MEMBERS')")
    @Operation(summary = "Get member selector options", description = "Returns active members for dropdown/selector")
    public ResponseEntity<ApiResponse<List<MemberSelectorDto>>> getSelectorOptions() {
        List<MemberSelectorDto> options = memberService.getSelectorOptions();
        return ResponseEntity.ok(ApiResponse.success(options));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_MEMBERS')")
    @Operation(summary = "Create member", description = "Creates a new member with optional family members")
    public ResponseEntity<ApiResponse<MemberViewDto>> create(@Valid @RequestBody MemberCreateDto dto) {
        MemberViewDto created = memberService.createMember(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Member created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_MEMBERS')")
    @Operation(summary = "Update member", description = "Updates an existing member and syncs family members")
    public ResponseEntity<ApiResponse<MemberViewDto>> update(
            @Parameter(description = "Member ID", required = true) @PathVariable Long id,
            @Valid @RequestBody MemberUpdateDto dto) {
        MemberViewDto updated = memberService.updateMember(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Member updated successfully", updated));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_MEMBERS') or hasAuthority('MANAGE_MEMBERS')")
    @Operation(summary = "Get member by ID", description = "Returns member details with family members")
    public ResponseEntity<ApiResponse<MemberViewDto>> get(
            @Parameter(description = "Member ID", required = true) @PathVariable Long id) {
        MemberViewDto member = memberService.getMember(id);
        return ResponseEntity.ok(ApiResponse.success(member));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_MEMBERS') or hasAuthority('MANAGE_MEMBERS')")
    @Operation(summary = "List members with pagination", description = "Returns paginated list of members")
    public ResponseEntity<ApiResponse<PaginationResponse<MemberViewDto>>> list(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDir,
            @Parameter(description = "Search query") @RequestParam(required = false) String search) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        PageRequest pageRequest = PageRequest.of(Math.max(0, page - 1), size, sort);
        
        Page<MemberViewDto> pageResult = memberService.listMembers(pageRequest, search);
        
        PaginationResponse<MemberViewDto> response = PaginationResponse.<MemberViewDto>builder()
                .items(pageResult.getContent())
                .total(pageResult.getTotalElements())
                .page(page)
                .size(size)
                .build();
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_MEMBERS')")
    @Operation(summary = "Delete member", description = "Soft deletes a member (sets active=false)")
    public ResponseEntity<ApiResponse<Void>> delete(
            @Parameter(description = "Member ID", required = true) @PathVariable Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.ok(ApiResponse.success("Member deleted successfully", null));
    }

    @GetMapping("/count")
    @PreAuthorize("hasAuthority('VIEW_MEMBERS') or hasAuthority('MANAGE_MEMBERS')")
    @Operation(summary = "Count members", description = "Returns total number of members")
    public ResponseEntity<ApiResponse<Long>> count() {
        long total = memberService.count();
        return ResponseEntity.ok(ApiResponse.success(total));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('VIEW_MEMBERS') or hasAuthority('MANAGE_MEMBERS')")
    @Operation(summary = "Search members", description = "Search members by query")
    public ResponseEntity<ApiResponse<List<MemberViewDto>>> search(@RequestParam String query) {
        List<MemberViewDto> results = memberService.search(query);
        return ResponseEntity.ok(ApiResponse.success(results));
    }
}
