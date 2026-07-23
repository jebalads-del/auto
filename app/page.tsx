              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: loading ? '#93c5fd' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'جاري التحقق...' : 'تحقق'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
