import sys, os

class HiddenPrints:
    def __init__(self, stdout=True, stderr=True):
        self.stdout = stdout
        self.stderr = stderr

    def __enter__(self):
        if self.stdout:
            self._original_stdout = sys.stdout
            sys.stdout = open(os.devnull, 'w')
        if self.stderr:
            self._original_stderr = sys.stderr
            sys.stderr = open(os.devnull, 'w')

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.stdout:
            sys.stdout.close()
            sys.stdout = self._original_stdout
        if self.stderr:
            sys.stderr.close()
            sys.stderr = self._original_stderr


with HiddenPrints():
    import compare
    import argparse


with HiddenPrints(stdout=False, stderr=False):
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf1", type=str)
    parser.add_argument("pdf2", type=str)
    parser.add_argument("--exclude", type=str, default=None)
    parser.add_argument("--text_thresh", type=float, default=0.4)
    parser.add_argument("--image_thresh", type=float, default=0.4)
    parser.add_argument("--edit_distance_thresh", type=float, default=0.8)
    parser.add_argument("--equal_substring_thresh", type=int, default=6)
    parser.add_argument("--filter_thresh", type=int, default=20)
    parser.add_argument("--dot_less_than_thresh", type=int, default=10)

    args = parser.parse_args()

    result = compare.get_digital_pdf_compare_result_json(
        path1=args.pdf1,
        path2=args.pdf2,
        path3=args.exclude,
        text_thresh=args.text_thresh,
        image_thresh=args.image_thresh,
        filter_thresh=args.filter_thresh,
        edit_distance_thresh=args.edit_distance_thresh,
        equal_substring_thresh=args.equal_substring_thresh,
        dot_less_than_thresh=args.dot_less_than_thresh,
    )

try:
    sys.stdout.write(result)
except Exception:
    pass