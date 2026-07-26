package news

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestParseIDList(t *testing.T) {
	t.Parallel()

	cases := []struct {
		name    string
		in      string
		want    []int64
		wantErr bool
	}{
		{name: "empty string returns nil", in: "", want: nil},
		{name: "single id", in: "42", want: []int64{42}},
		{name: "csv with spaces", in: " 1 , 2 , 3 ", want: []int64{1, 2, 3}},
		{name: "duplicates are deduped preserving order", in: "1,2,1,3,2", want: []int64{1, 2, 3}},
		{name: "empty items are skipped", in: "1,,2,", want: []int64{1, 2}},
		{name: "invalid token fails", in: "1,abc,3", wantErr: true},
		{name: "negative numbers allowed by parser", in: "-1,2", want: []int64{-1, 2}},
	}

	for _, tc := range cases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got, err := parseIDList(tc.in)
			if tc.wantErr {
				assert.Error(t, err)
				return
			}
			require.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}
