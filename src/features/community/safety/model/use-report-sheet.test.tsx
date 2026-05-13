import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import { isValidElement, type ReactNode } from 'react';

import { useReportSheet } from './use-report-sheet';

const mockPresent = jest.fn();
const mockDismiss = jest.fn();
const mockReport = jest.fn();
const mockResetReportState = jest.fn();

jest.mock('@/shared/ui', () => {
  const actual = jest.requireActual('@/shared/ui');
  return {
    ...actual,
    useBottomSheet: () => ({ present: mockPresent, dismiss: mockDismiss })
  };
});

jest.mock('./use-report', () => ({
  useReport: () => ({ report: mockReport, isPending: false })
}));

jest.mock('./report-reason-state', () => ({
  useResetReportReasonState: () => mockResetReportState
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useReportSheet', () => {
  it('openReportSheet 호출 시 present + 상태 초기화 + sticky footerComponent 가 전달된다', () => {
    const { result } = renderHook(() => useReportSheet(), { wrapper });

    act(() => result.current.openReportSheet({ type: 'POST', id: 1 }));

    expect(mockResetReportState).toHaveBeenCalled();
    expect(mockPresent).toHaveBeenCalledTimes(1);

    const [node, opts] = mockPresent.mock.calls[0];
    expect(isValidElement(node)).toBe(true);
    // BP: footerComponent 로 sticky footer 전달
    expect(typeof opts?.footerComponent).toBe('function');
    expect(opts?.snapPoints).toBeDefined();
  });

  it('footer 의 onSubmit 호출 시 report(target, reason) + dismiss 가 실행된다', async () => {
    mockReport.mockResolvedValue(undefined);
    const { result } = renderHook(() => useReportSheet(), { wrapper });

    act(() => result.current.openReportSheet({ type: 'COMMENT', id: 42 }));

    const opts = mockPresent.mock.calls[0][1] as {
      footerComponent: (p: unknown) => React.ReactNode;
    };
    const footerNode = opts.footerComponent({ animatedFooterPosition: { value: 0 } }) as React.ReactElement<{
      children: React.ReactElement<{ onSubmit: (r: string, d?: string) => Promise<void> }>;
    }>;
    // BottomSheetFooter wrap 안에 ReportReasonSheetFooterButton 이 있고 그 props.onSubmit 추출
    const onSubmit = footerNode.props.children.props.onSubmit;

    await act(async () => {
      await onSubmit('ABUSE', undefined);
    });

    expect(mockReport).toHaveBeenCalledWith({ type: 'COMMENT', id: 42 }, 'ABUSE', undefined);
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it('OTHER 사유 + 상세텍스트로 onSubmit 시 reasonDetail 전달', async () => {
    mockReport.mockResolvedValue(undefined);
    const { result } = renderHook(() => useReportSheet(), { wrapper });

    act(() => result.current.openReportSheet({ type: 'POST', id: 7 }));

    const opts = mockPresent.mock.calls[0][1] as {
      footerComponent: (p: unknown) => React.ReactNode;
    };
    const footerNode = opts.footerComponent({ animatedFooterPosition: { value: 0 } }) as React.ReactElement<{
      children: React.ReactElement<{ onSubmit: (r: string, d?: string) => Promise<void> }>;
    }>;
    const onSubmit = footerNode.props.children.props.onSubmit;

    await act(async () => {
      await onSubmit('OTHER', '상세 사유');
    });

    expect(mockReport).toHaveBeenCalledWith({ type: 'POST', id: 7 }, 'OTHER', '상세 사유');
  });
});
