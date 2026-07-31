'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { createColumns } from './columns';
import { useCourseTableFilters } from './use-course-table-filters';
import { Course } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import axiosInstance from '@/lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCallback, useMemo, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default function CourseTable({
  data,
  totalData
}: {
  data: Course[];
  totalData: number;
}) {
  const { searchQuery, setPage, setSearchQuery } = useCourseTableFilters();
  const queryClient = useQueryClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const imageBaseUrl = process.env.NEXT_PUBLIC_NEW_IMAGES;

  const courseImageFields: { key: keyof Course; label: string }[] = [
    { key: 'coursePreviewThumbnail', label: 'Thumbnail' },
    { key: 'coursePreviewCover', label: 'Cover' },
    { key: 'metaImage', label: 'Meta Image' },
    { key: 'ogImage', label: 'OG Image' }
  ];

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const selectedCourses = useMemo(
    () => data.filter((course) => selectedIds.has(course._id)),
    [data, selectedIds]
  );

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (ids.length > 0 && ids.every((id) => next.has(id))) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  }, []);

  const columns = useMemo(
    () => createColumns({ selectedIds, onToggle: handleToggle, onToggleAll: handleToggleAll }),
    [selectedIds, handleToggle, handleToggleAll]
  );

  const bulkImageUploadMutation = useMutation({
    mutationFn: async () => {
      if (Object.keys(files).length === 0) return;
      const formData = new FormData();
      courseImageFields.forEach(({ key }) => {
        const file = files[key];
        if (file) {
          formData.append(key, file);
        }
      });
      formData.append(
        'courseIds',
        JSON.stringify(selectedCourses.map((c) => c._id))
      );

      const response = await axiosInstance.post(
        `${apiUrl}/course/bulk-image-upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success(`${res.data.message}`);
      setIsModalOpen(false);
      setFiles({});
      setPreviews({});
      setSelectedIds(new Set());
    },
    onError: () => {
      toast.error('Failed to upload images to courses');
    }
  });

  const handleFileChange = (
    key: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [key]: file }));
      setPreviews((prev) => {
        if (prev[key]) {
          URL.revokeObjectURL(prev[key]);
        }
        return { ...prev, [key]: URL.createObjectURL(file) };
      });
    }
  };

  const handleBulkUpload = () => {
    if (Object.keys(files).length === 0) {
      toast.error('Please select at least one image');
      return;
    }
    bulkImageUploadMutation.mutate();
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const onClose = () => {
    setIsModalOpen(false);
    setFiles({});
    setPreviews({});
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <DataTableSearch
          searchKey="name"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setPage={setPage}
        />
      </div>

      {selectedCourses.length > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted/40 p-3">
          <span className="text-sm font-medium">
            {selectedCourses.length} course(s) selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Bulk Image Upload
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <DataTable columns={columns} data={data} totalItems={totalData} />

      <Modal
        title="Bulk Image Upload"
        description="Upload an image that will be applied to all selected courses"
        isOpen={isModalOpen}
        onClose={onClose}
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Selected courses: {selectedCourses.length}
            </label>
            <div className="max-h-64 space-y-4 overflow-y-auto rounded border p-3">
              {selectedCourses.map((course) => (
                <div key={course._id} className="space-y-1">
                  <div className="text-sm font-medium">{course.courseTitle}</div>
                  <div className="flex flex-wrap gap-2">
                    {courseImageFields.map(({ key, label }) => {
                      const imagePath = course[key];
                      return (
                        <div key={key} className="text-center">
                          <div className="flex h-14 w-20 items-center justify-center overflow-hidden rounded border bg-muted">
                            {imagePath ? (
                              <Image
                                src={`${imageBaseUrl}/${imagePath}`}
                                alt={label}
                                width={80}
                                height={56}
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-[10px] text-muted-foreground">
                                No image
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Select images (same images will be applied to all {selectedCourses.length} course(s))
            </label>
            <div className="space-y-3">
              {courseImageFields.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
                    {previews[key] ? (
                      <Image
                        src={previews[key]}
                        alt={label}
                        width={64}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">
                        No image
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium">
                      {label}
                    </label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(key, e)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkUpload}
              disabled={
                bulkImageUploadMutation.isPending || Object.keys(files).length === 0
              }
            >
              {bulkImageUploadMutation.isPending
                ? 'Uploading...'
                : 'Upload Images'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
