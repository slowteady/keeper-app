import { CommentFormInput, CommentList, CommentListHeader, CommentSortOrderDto } from '@/entities';

export interface CommentSectionProps {
  commentCount: number;
  sortOrder: CommentSortOrderDto;
  onChangeSortOrder: (order: CommentSortOrderDto) => void;
  placeholder?: string;
}

export const CommentSection = ({
  commentCount,
  sortOrder,
  onChangeSortOrder,
  placeholder = '아직 댓글이 없습니다.\n여러분의 의견을 적어주세요:)'
}: CommentSectionProps) => {
  return (
    <>
      <CommentListHeader commentCount={commentCount} sortOrder={sortOrder} onChangeSortOrder={onChangeSortOrder} />
      <CommentList placeholder={placeholder} commentList={[]} />
      <CommentFormInput />
    </>
  );
};
