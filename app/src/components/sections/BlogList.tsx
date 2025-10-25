"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import BlogCard from "@/components/elements/BlogCard";
import Spacer from "@/components/util/Spacer";
import styles from "./BlogList.module.css";
import Eyebrow from "../elements/GEyebrow";
import Link from "next/link";

export interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    author: {
        name: string;
        slug: string;
        role?: string;
        company?: string;
        avatarUrl?: string;
    };
    publishedAt: string;
    category: string;
    featuredImageUrl?: string;
    featuredImageAlt?: string;
}

interface BlogListProps {
    posts: BlogPost[];
    pageData?: {
        title?: string;
        description?: string;
        eyebrow?: string;
        subscribeButtonText?: string;
        subscribeButtonLink?: string;
    };
}

const categories = ["All Posts", "Company", "Product", "Engineering", "Customers", "News"];

export default function BlogList({ posts, pageData }: BlogListProps) {
    const [activeCategory, setActiveCategory] = useState("All Posts");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);

    // Focus input when expanded
    useEffect(() => {
        if (isSearchExpanded && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchExpanded]);

    const filteredPosts = useMemo(() => {
        let filtered = posts;

        // Filter by category
        if (activeCategory !== "All Posts") {
            filtered = filtered.filter((post) => post.category === activeCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (post) =>
                    post.title.toLowerCase().includes(query) ||
                    post.excerpt.toLowerCase().includes(query) ||
                    post.author.name.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [posts, activeCategory, searchQuery]);

    return (
        <section className="bg-theme-bg text-theme-text">
            <Spacer size="main" />

            {pageData?.eyebrow ? (
                <>
                    <div className="u-container max-w-[none] flex flex-col gap-4 t:grid t:grid-cols-12">
                        <Eyebrow customClass="t:col-span-6">{pageData.eyebrow}</Eyebrow>
                        {pageData.description && <h1 className="t:col-span-6 text-large hidden t:block">{pageData.description}</h1>}
                    </div>
                    <Spacer size="main" />
                </>
            ) : (
                <></>
            )}

            <div className="u-container max-w-[none]">
                {/* Filters and Search */}
                <div className="mb-8 flex flex-wrap t:flex-nowrap items-center justify-between gap-4">
                    {/* Category Filters - Desktop */}
                    <div className="hidden t:flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`text-small cursor-pointer ${
                                    activeCategory === category ? "btn-main-wrap is-primary" : "btn-main-wrap is-secondary"
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Mobile Layout - Category + Search + Subscribe */}
                    <div className="t:hidden flex items-center justify-between gap-4 w-full">
                        {/* Category Dropdown - Mobile */}
                        <div className="relative flex-shrink-0" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="btn-main-wrap is-secondary flex items-center gap-2 text-small"
                            >
                                {activeCategory}
                                <ChevronDown className={`w-2 h-2 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                            </button>
                            {isDropdownOpen && (
                                <div className={styles.dropdown}>
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => {
                                                setActiveCategory(category);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`${styles.dropdownItem} ${activeCategory === category ? styles.dropdownItemActive : ""}`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Search and Subscribe - Right aligned */}
                        <div className="flex items-center gap-2 flex-1 justify-end">
                            {/* Search Bar - Mobile (Expandable) */}
                            <div className={`${styles.mobileSearchWrapper} ${isSearchExpanded ? "flex-grow" : "flex-shrink-0"}`}>
                                <div className={styles.mobileSearchContainer}>
                                    <Search className={styles.mobileSearchIcon} />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search posts..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setIsSearchExpanded(true)}
                                        className={styles.mobileSearchInput}
                                    />
                                    {isSearchExpanded && (
                                        <button
                                            onClick={() => {
                                                setSearchQuery("");
                                                setIsSearchExpanded(false);
                                                searchInputRef.current?.blur();
                                            }}
                                            className={styles.clearButton}
                                            aria-label="Clear search"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Subscribe Button - Mobile */}
                            <Link
                                href={pageData?.subscribeButtonLink || ""}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-main-wrap is-primary flex items-center justify-center text-small group flex-shrink-0"
                            >
                                <svg
                                    className="w-[0.75em] rotate-[45deg] group-hover:rotate-[0deg] transition-transform duration-[400ms] ease-[ease]"
                                    width="100%"
                                    height="100%"
                                    viewBox="0 0 21 17"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M0.430332 7.57992L16.682 7.58375L11.2771 2.17879L12.78 0.675862L20.7046 8.60042L12.8243 16.4806L11.402 15.0583L16.8247 9.63556L0.430821 9.65201L0.430332 7.57992Z"
                                        fill="currentColor"
                                    />
                                </svg>
                                <span className="invisible">|</span>
                            </Link>
                        </div>
                    </div>

                    {/* Search Bar and Subscribe Button - Desktop */}
                    <div className="hidden t:flex items-center gap-3">
                        {/* Search Bar - Desktop */}
                        <div className="flex-shrink-0">
                            <div className={styles.searchContainer}>
                                <Search className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Search posts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={styles.searchInput}
                                />
                            </div>
                        </div>

                        {/* Subscribe Button - Desktop */}
                        <Link
                            href={pageData?.subscribeButtonLink || ""}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-main-wrap is-primary flex items-center gap-2 text-small group"
                        >
                            {pageData?.subscribeButtonText}
                            <svg
                                className="w-[0.75em] ml-xxs rotate-[45deg] group-hover:rotate-[0deg] transition-transform duration-[400ms] ease-[ease]"
                                width="100%"
                                height="100%"
                                viewBox="0 0 21 17"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M0.430332 7.57992L16.682 7.58375L11.2771 2.17879L12.78 0.675862L20.7046 8.60042L12.8243 16.4806L11.402 15.0583L16.8247 9.63556L0.430821 9.65201L0.430332 7.57992Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Blog Posts Grid */}
                {filteredPosts.length > 0 ? (
                    <div className="mt-xs mb-large grid grid-cols-1 t:grid-cols-3 gap-2 t:gap-3">
                        {filteredPosts.map((post) => (
                            <BlogCard
                                key={post._id}
                                title={post.title}
                                excerpt={post.excerpt}
                                author={post.author.name}
                                publishedAt={post.publishedAt}
                                category={post.category}
                                slug={post.slug}
                                featuredImageUrl={post.featuredImageUrl}
                                featuredImageAlt={post.featuredImageAlt}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-large">
                        <p className="text-large text-theme-text-secondary">No posts found matching your criteria.</p>
                    </div>
                )}
            </div>
            <Spacer size="main" />
        </section>
    );
}
